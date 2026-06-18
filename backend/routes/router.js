const express = require("express");
const router = express.Router();

const authRoutes = require("../controller/authController");
const resumeRoutes = require("../controller/resumeController");

console.log("Main router loaded");
router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);

module.exports = router;