const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const db = require('../model/index')
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const User = db.User;
const otpStore = {}
const transporter = nodemailer.createTransport({
    host:"smtp.office365.com",
    port: 587,
    secure: false,
    pool: true,
    maxConnections:2,
    maxMessages:100,
    auth:{
      user:process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls:{
      rejectUnauthorized:false
    }
});
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    otpStore[email] = otp;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your account',
      text: `Your OTP is ${otp}`
    });
    res.json({
      message: 'Otp sent'
    })
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
})
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email is missing"
      })
    }
    if(otpStore[email]!==otp){
      return res.status(404).json({message:'Incorrect otp'});
    }
    delete otpStore[email];
    return res.json({
      message:'Success'
    })
  }catch(err){
    console.log(err);
  }
})
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }, { attributes: ["id", "name", "email", "dob", "createdAt"] })
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.log("Profile fetch error:", err);

    res.status(500).json({
      message: "Something went wrong while fetching profile",
    });
  }
})
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, dob, loc } = req.body;
    if (!name || !dob || !loc) {
      return res.status(400).json({
        message: "Name, location and date of birth are required",
      })
    }
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }
    await user.update({
      name: name,
      dob: dob,
      location: loc
    })
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        location: user.location
      },
    });
  } catch (err) {
    console.log("Profile update error:", err);

    res.status(500).json({
      message: "Something went wrong while updating profile",
    });
  }
});
router.post("/signup", async (req, res) => {
  try {
    const { name, email, number, password, dob, location } = req.body;

    if (!name || !email || !password || !dob || !number) {
      return res.status(400).json({
        message: "Name, email, dob and password are required",
      });
    }
    const age = calculateAge(dob);
    if (age < 18) {
      return res.status(403).json({
        message: "You must be at least 18 years old to create a resume.",
      });
    }
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      phone: number,
      dob,
      location
    })
    res.status(201).json({
      message: "Signup successful",
      user: {
        name,
        email,
        dob,
        phone: number,
        location
      },
    });
  } catch (err) {
    console.log("Signup error:", err);

    res.status(500).json({
      message: "Something went wrong during signup",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log("Login error:", err);

    res.status(500).json({
      message: "Something went wrong during login",
    });
  }
});

router.get("/me", (req, res) => {
  res.json({
    message: "Auth controller is working",
  });
});

module.exports = router;