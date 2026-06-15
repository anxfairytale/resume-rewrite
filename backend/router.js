const express = require("express");
const router = express.Router();

const authRoutes = require("./controller/authController");
const resumeRoutes = require("./routes/resumeRoutes");

console.log("Main router loaded");

router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);

module.exports = router;