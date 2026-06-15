const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require('../model/index')
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const User = db.User;
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
    const user = await User.findOne({ where: { id:req.user.id } }, { attributes: ["id", "name", "email", "dob", "createdAt"] })
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
router.put("/profile",authenticateToken,async(req,res)=>{
  try{
    const {name,dob}=req.body;
    if(!name ||!dob){
      return res.status(400).json({
        message:"Name and date of birth are required",
      })
    }
    const user=await User.findOne({where:{id:req.user.id}});
    if(!user){
      return res.status(404).json({
        message:"User not found",
      })
    }
    await user.update({
      name: name,
      dob: dob,
  })
     res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob,
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
    const { name, email, password, dob } = req.body;

    if (!name || !email || !password || !dob) {
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
      dob
    })
    res.status(201).json({
      message: "Signup successful",
      user: {
        name,
        email,
        dob
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