const express = require("express");
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../middleware/authMiddleware");
const resumeController = require("../controller/resumeController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
});

router.post(
  "/analyze",
  authenticateToken,
  upload.single("resume"),
  resumeController.analyzeResume
);

router.post(
  "/generate-pdf",
  authenticateToken,
  resumeController.generateFinalPdf
);

router.get(
  "/my-resumes",
  authenticateToken,
  resumeController.getMyResumes
);

module.exports = router;