const express = require("express");
const router = express.Router();

const authRoutes = require("../controller/authController");
const resumeRoutes = require("../controller/resumeController");
const paymentRoutes=require("../controller/paymentController");
const settingsRoute=require("../controller/settingsController")
console.log("Main router loaded");
router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);
router.use("/payment",paymentRoutes);
router.use("/settings",settingsRoute);
module.exports = router;