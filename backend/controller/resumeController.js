require('dotenv').config()
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../model");
const User=db.User;
const Resume = db.Resume;
const { applyResumeTemplate } = require("../pdfTemplates/resumeTemplates");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const express = require("express");
const multer = require("multer");
const authenticateToken = require("../middleware/authMiddleware");
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
console.log("Resume controller loaded");
async function improveResumeFieldWithAI(text, fieldName, instruction) {
  const prompt = `
  You are a professional resume writer.

Improve the following resume field.

Field: ${fieldName}

User instruction:
${instruction || "Make it clearer, stronger, professional, and ATS-friendly."}

Rules:
- Do not invent fake experience.
- Keep the meaning truthful.
- Return only the improved text.
- Do not add explanations.

Text:
${text}`;
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      }
    ]
  });
  return response.choices[0].message.content.trim();
}
async function analyzeResumeMatch({
  resumeData, jobDescription, skills, userLocation
}) {
  const prompt = `
You are an AI resume-job match evaluator.

Analyze how well this candidate's resume/profile matches the given job description.

Important:
- Do not claim this is a hiring probability.
- This is only a resume-to-job-description match estimate.
- Do not invent skills or experience.
- Be honest but helpful.
- Return ONLY valid JSON.
- No markdown.
- No explanation outside JSON.

Return JSON in this exact shape:

{
  "matchPercentage": 0,
  "summary": "",
  "strongMatches": [],
  "missingSkills": [],
  "importantKeywords": [],
  "resumeImprovements": [],
  "relocation": {
    "needed": false,
    "message": ""
  },
  "upskillingSuggestions": [
    {
      "skill": "",
      "reason": "",
      "searchPhrase": ""
    }
  ]
}

Scoring guide:
- 85-100: Very strong match
- 70-84: Good match
- 50-69: Partial match
- Below 50: Weak match

Candidate location:
${userLocation || "Not provided"}

Candidate extra skills/notes:
${skills || "Not provided"}

Resume/Profile data:
${JSON.stringify(resumeData, null, 2)}

Job description:
${jobDescription}
`;
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: prompt
      },
    ],
    temperature: 0.3
  });
  const content = response.choices[0].message.content;
  try{
    return JSON.parse(content);
  }catch(err){
    console.log("AI match JSON parse error: ",err);
    console.log("AI returned: ",content);
    return {
      matchPercentage: 0,
      summary: "Could not generate a reliable match analysis for this resume.",
      strongMatches: [],
      missingSkills: [],
      importantKeywords: [],
      resumeImprovements: [],
      relocation: {
        needed: false,
        message: "Relocation could not be analyzed.",
      },
      upskillingSuggestions: [],
    }
  }
}
async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}
function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
}

function splitSkills(skills) {
  if (!skills) return [];
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function getRoleFromJobDescription(jobDescription) {
  const lower = jobDescription.toLowerCase();

  if (lower.includes("mainframe")) return "Mainframe Support Engineer";
  if (lower.includes("react")) return "React Developer";
  if (lower.includes("node")) return "Node.js Developer";
  if (lower.includes("frontend")) return "Frontend Developer";
  if (lower.includes("backend")) return "Backend Developer";
  if (lower.includes("full stack") || lower.includes("fullstack")) return "Full Stack Developer";
  if (lower.includes("data analyst")) return "Data Analyst";

  return "Professional Candidate";
}

async function createStructuredResumeDataWithAI({ resumeText, jobDescription, skills, user }) {
  const prompt = `
You are an expert resume writer and ATS optimization specialist.

Your task:
Read the candidate's resume and the target job description.
Create a polished, employer-catching, ATS-friendly resume structure.

Important rules:
- Do not invent fake companies, fake degrees, fake certifications, or fake years.
- You may improve wording, clarity, impact, and alignment with the job.
- Use the candidate's real experience from the resume text.
- If a detail is missing, leave it blank or use a safe placeholder.
- Tailor the summary, skills, experience bullets, and projects to the job description.
- Use strong action verbs.
- Keep bullets concise and professional.
- Return ONLY valid JSON.
- No markdown.
- No explanation.

Candidate user details:
Name: ${user?.name || ""}
Email: ${user?.email || ""}

Extra skills/notes typed by user:
${skills || "None"}

Target job description:
${jobDescription}

Candidate resume text:
${resumeText}

Return JSON in this exact structure:
{
  "fullName": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "portfolio": "",
  "summary": "",
  "skills": [],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "bullets": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": ""
    }
  ],
  "certifications": [],
  "achievements": []
}
`;

  const response = await client.responses.create({
    model: "gpt-5.5",
    input: prompt,
  });

  const text = response.output_text;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.log("AI JSON parse error:", err);
    console.log("AI raw response:", text);
    throw new Error("AI returned invalid JSON");
  }
}
router.post("/analyze", authenticateToken, upload.single("resume"), async (req, res) => {
  try {
    console.log("ANALYZE BODY:", req.body);
    console.log("ANALYZE FILE:", req.file);
    const { jobDescription, skills } = req.body;
    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        message: "Job description is required",
      });
    }
    const resumeText = await extractTextFromPdf(resumeFile.path);
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        message: "Could not read enough text from this PDF. Please upload a text-based resume PDF.",
      });
    }
    const resumeData = await createStructuredResumeDataWithAI({
      resumeText,
      jobDescription,
      skills,
      user: req.user,
    });
    const user=await User.findByPk(req.user.id);
    const matchAnalysis=await analyzeResumeMatch({resumeData,jobDescription,skills,userLocation:user.location||"Not provided"})
    res.json({
      message: "AI resume sections generated successfully",
      resumeData,
      matchAnalysis,
      originalFileName: resumeFile.originalname,
      originalFilePath: resumeFile.path,
      jobDescription,
      skills,
    });
  } catch (err) {
    console.log("Analyze resume error:", err);
    res.status(500).json({
      message: err.message || "Something went wrong while analyzing resume",
    });
  }
}
);

router.post("/generate-pdf", authenticateToken, async (req, res) => {
  try {
    const {
      resumeData,
      template,
      originalFileName,
      originalFilePath,
      jobDescription,
      skills,
    } = req.body;
    console.log(req.body)
    if (!resumeData) {
      return res.status(400).json({
        message: "Resume data is required",
      });
    }

    const selectedTemplate = template || "executive";

    const generatedFolder = path.join(__dirname, "..", "generated");
    ensureFolder(generatedFolder);
    const generatedFileName = `resume-${Date.now()}.pdf`;
    const generatedPdfPath = path.join(generatedFolder, generatedFileName);
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });
    const stream = fs.createWriteStream(generatedPdfPath);
    doc.pipe(stream);
    applyResumeTemplate(doc, selectedTemplate, resumeData);
    doc.end();

    stream.on("finish", async () => {
      const generatedPdfUrl = `http://localhost:5000/generated/${generatedFileName}`;
      await Resume.create({
        userId: req.user.id,
        originalFileName: originalFileName || null,
        originalFilePath: originalFilePath || null,
        jobDescription: jobDescription || null,
        skills: skills || null,
        resumeData: JSON.stringify(resumeData),
        generatedPdfPath,
        generatedPdfUrl,
        template: selectedTemplate,
      });

      res.json({
        message: "Final PDF generated successfully",
        pdfUrl: generatedPdfUrl,
      });
    });

    stream.on("error", (err) => {
      console.log("PDF stream error:", err);

      res.status(500).json({
        message: "Could not create PDF",
      });
    });
  } catch (err) {
    console.log("Generate final PDF error:", err);

    res.status(500).json({
      message: "Something went wrong while generating final PDF",
    });
  }
}
);
router.post("/improve-field", authenticateToken, async (req, res) => {
  try {
    const { text, fieldName, instruction } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" })
    }
    const improvedText = await improveResumeFieldWithAI(
      text, fieldName, instruction
    );
    res.json({ improvedText });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Could not improve field" });
  }
})
router.get("/my-resumes", authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    const formattedResumes = resumes.map((resume) => {
      const plain = resume.toJSON();

      return {
        ...plain,
        resumeData: plain.resumeData ? JSON.parse(plain.resumeData) : null,
      };
    });

    res.json(formattedResumes);
  } catch (err) {
    console.log("Fetch my resumes error:", err);

    res.status(500).json({
      message: "Could not fetch resumes",
    });
  }
}
);
module.exports = router;