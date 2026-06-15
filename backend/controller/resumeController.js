const express = require("express");
const router = express.Router();
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const { applyResumeTemplate } = require("../pdfTemplates/resumeTemplates")
const authenticateToken = require("../middleware/authMiddleware")
const db = require('../model/index')
const Resume = db.Resume;
console.log("Resume controller loaded");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
async function rewriteResumeWithAI(extractedResumeText, jobDescription, skills) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions: `You are an expert resume writer.

Your job is to rewrite resumes honestly based only on the candidate's uploaded resume content.

Rules:
- Do not invent fake companies, fake experience, fake education, or fake achievements.
- Improve wording, clarity, formatting, and relevance.
- Tailor the resume to the target job description.
- Use the extra skills only if they fit the candidate's resume.
- Keep the tone professional and ATS-friendly.
- Return only the rewritten resume content.
- Do not include explanations before or after the resume.
`, input: `
UPLOADED RESUME TEXT:
${extractedResumeText}
TARGET JOB DESCRIPTION:
${jobDescription || "No job description provided"}
EXTRA SKILLS TO HIGHLIGHT:
${skills || "No extra skills provided."}
Now rewrite the resume in this format:
FULL NAME
Email | Phone | LinkedIn | GitHub/Portfolio

PROFESSIONAL SUMMARY

KEY SKILLS

PROJECTS / EXPERIENCE

EDUCATION

CERTIFICATIONS / ACHIEVEMENTS

ADDITIONAL DETAILS`
  });
  return response.output_text;
}
router.get('/test', (req, res) => {
  res.send("i work");
})
router.post("/upload", authenticateToken, upload.single("resume"), async (req, res) => {
  try {
    console.log("BODY DATA:", req.body);
    console.log("FILE DATA:", req.file);

    const { jobDescription, skills, consent, template } = req.body;
    const selectedTemplate = template || "modern";

    if (consent !== "true") {
      return res.status(403).json({
        message: "You must accept the terms and conditions before generating.",
      });
    }

    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const pdfBuffer = fs.readFileSync(resumeFile.path);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedResumeText = pdfData.text;

    if (!extractedResumeText || extractedResumeText.trim().length === 0) {
      return res.status(400).json({
        message:
          "Could not extract text from this PDF. It may be scanned or image-based.",
      });
    }

    const rewrittenResume = await rewriteResumeWithAI(
      extractedResumeText,
      jobDescription,
      skills
    );

    const generatedFileName = `resume-${Date.now()}.pdf`;
    const generatedPath = path.join("generated", generatedFileName);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const stream = fs.createWriteStream(generatedPath);

    doc.pipe(stream);

    applyResumeTemplate(doc, selectedTemplate, rewrittenResume);

    doc.end();

    stream.on("finish", async () => {
      const pdfUrl = `http://localhost:5000/generated/${generatedFileName}`;
      await Resume.create({
        userId: req.user.id,
        originalFileName: resumeFile.originalname,
        originalFilePath: resumeFile.path,
        jobDescription,
        skills,
        rewrittenResume,
        generatedPdfPath:generatedPath,
        generatedPdfUrl: pdfUrl,
        template: selectedTemplate,
      })
      res.json({
        message: "Resume received and PDF generated",
        skills,
        selectedTemplate,
        fileName: resumeFile.originalname,
        savedAs: resumeFile.filename,
        rewrittenResume,
        pdfUrl,
      });
    });

    stream.on("error", (err) => {
      console.log("PDF stream error:", err);

      res.status(500).json({
        message: "PDF generation failed",
      });
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Something went wrong on the server",
    });
  }
}
);
router.get("/my-resumes",authenticateToken,async(req,res)=>{
  try{
    const resumes=await Resume.findAll({
      where:{
        userId:req.user.id,
      },
      order:[["createdAt","DESC"]]
    })
    res.json(resumes);
  }catch(err){
    console.log("Fetching error",err);
     res.status(500).json({
      message: "Could not fetch resumes",
    });
  }
})
module.exports = router;