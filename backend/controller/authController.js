const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const db = require('../model/index')
const router = express.Router();
const authorizeAdmin = require("../middleware/adminMiddleware")
const authenticateToken = require("../middleware/authMiddleware");
const User = db.User;
const Resume = db.Resume;
const Setting = db.Setting;
const otpStore = {}
const verifiedEmails = {}
const verifiedPhones = {}
const {Op}=require("sequelize");
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  pool: true,
  maxConnections: 2,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const {plan,search}=req.query;
    const where={};
    if(plan){
      where.plan=plan;
    }
    if(search){
      where[Op.or]=[
        {name:{[Op.like]:`%${search}%`}},
        {email:{[Op.like]:`%${search}%`}},
        {phone:{[Op.like]:`%${search}%`}}
      ];
    }
    const users = await User.findAll({
      where,
      include: [{
        model: Resume,
      }],
      order: [["createdAt", "DESC"]]
    });
    const formattedUsers = users.map((user) => {
      const plainUser = user.toJSON();
      const resumes = plainUser.Resumes || plainUser.resumes || [];
      return {
        id: plainUser.id,
        name: plainUser.name,
        email: plainUser.email,
        phone: plainUser.phone || "Not provided",
        emailStatus: plainUser.isEmailVerified ? "Verified" : "Not Verified",
        phoneStatus: plainUser.isPhoneVerified ? "Verified" : "Not Verified",
        plan: plainUser.plan,
        isBlocked: plainUser.isBlocked,

        freeUsesLeft: plainUser.freeUsesLeft,
        proUsesLeft: plainUser.proUsesLeft,
        totalUses: plainUser.totalUses,

        resumesGenerated: resumes.length,

        registeredAt: plainUser.createdAt,
        lastUsedAt:
          resumes.length > 0
            ? resumes[resumes.length - 1].createdAt
            : null
      }
    });
    res.json(formattedUsers);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
})
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
    if (otpStore[email] !== otp) {
      return res.status(404).json({ message: 'Incorrect otp' });
    }
    delete otpStore[email];
    verifiedEmails[email] = true;
    return res.json({
      message: 'Success'
    })
  } catch (err) {
    console.log(err);
  }
})
router.patch("/users/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
})
router.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "The user does not exist" })
    }
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(400).json("Could not fetch user")
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
    const arr=loc.split(",");
    console.log(arr[0]);
    console.log(arr[1]);
    console.log(arr[2]);
    await user.update({
      name: name,
      dob: dob,
      location: loc,
      city:arr[0],
      state:arr[1],
      country:arr[2]
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
    const { name, email, number, password, dob, country, state, city } = req.body;

    if (!name || !email || !password || !dob || !number) {
      return res.status(400).json({
        message: "Name, email, dob and password are required",
      });
    }
    if (!country || !state || !city) {
      return res.status(400).json({
        message: "Country, state, and city are required",
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
    const location = `${city},${state},${country}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        freeTrialUses: 5,
        paidAmount: 99
      });
    }
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: number,
      dob,
      isEmailVerified: verifiedEmails[email],
      country,
      state,
      city,
      location,
      freeUsesLeft:settings.freeTrialUses
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
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked.Please contact admin.",
      })
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
        role: user.role
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
        role: user.role
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