require('dotenv').config()
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../model");
const User = db.User;
const Resume = db.Resume;
const { applyResumeTemplate } = require("../pdfTemplates/resumeTemplates");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const DEFAULT_SECTION_ORDER = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
];

const ALLOWED_SECTIONS = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
];

const ALLOWED_FONTS = [
  "Helvetica",
  "Times-Roman",
  "Courier",
];

const ALLOWED_ALIGNMENTS = [
  "left",
  "center",
];

const ALLOWED_HEADER_BACKGROUNDS = [
  "none",
  "tint",
  "accent",
];

const ALLOWED_DIVIDER_STYLES = [
  "solid",
  "dotted",
  "dashed",
  "double",
  "short",
  "none",
];

const ALLOWED_HEADING_STYLES = [
  "uppercase",
  "title-case",
  "left-border",
  "accent-block",
];

const ALLOWED_BULLET_STYLES = [
  "circle",
  "dash",
  "square",
  "arrow",
];

const ALLOWED_SKILLS_LAYOUTS = [
  "inline",
  "comma-separated",
  "bullets",
  "two-column",
];

const ALLOWED_CONTACT_SEPARATORS = [
  "pipe",
  "dot",
  "bullet",
];

const TEMPLATE_STYLE_DEFAULTS = {
  executive: {
    accentColor: "#d47706",
    fontFamily: "Helvetica",
    bodyFontSize: 10.5,
    headingFontSize: 12,
    nameFontSize: 25,
    lineGap: 4,
    sectionSpacing: 0.8,
    pageMargin: 50,

    headerAlignment: "left",
    headerBackground: "tint",

    showSectionLines: true,
    dividerStyle: "solid",
    dividerThickness: 1,

    headingStyle: "uppercase",
    bulletStyle: "circle",
    skillsLayout: "inline",
    contactSeparator: "pipe",

    sectionOrder: [
      ...DEFAULT_SECTION_ORDER,
    ],

    hiddenSections: [],
  },
    "executive-navy": {
    accentColor: "#17324d",
    fontFamily: "Helvetica",
    bodyFontSize: 10.5,
    headingFontSize: 12,
    nameFontSize: 25,
    lineGap: 4,
    sectionSpacing: 0.8,
    pageMargin: 50,

    headerAlignment: "left",
    headerBackground: "tint",

    showSectionLines: true,
    dividerStyle: "solid",
    dividerThickness: 1,

    headingStyle: "uppercase",
    bulletStyle: "circle",
    skillsLayout: "inline",
    contactSeparator: "pipe",

    sectionOrder: [
      ...DEFAULT_SECTION_ORDER,
    ],

    hiddenSections: [],
  },

  "executive-brown": {
    accentColor: "#6b4423",
    fontFamily: "Helvetica",
    bodyFontSize: 10.5,
    headingFontSize: 12,
    nameFontSize: 25,
    lineGap: 4,
    sectionSpacing: 0.8,
    pageMargin: 50,

    headerAlignment: "left",
    headerBackground: "tint",

    showSectionLines: true,
    dividerStyle: "solid",
    dividerThickness: 1,

    headingStyle: "uppercase",
    bulletStyle: "circle",
    skillsLayout: "inline",
    contactSeparator: "pipe",

    sectionOrder: [
      ...DEFAULT_SECTION_ORDER,
    ],

    hiddenSections: [],
  },

  "executive-forest": {
    accentColor: "#245440",
    fontFamily: "Helvetica",
    bodyFontSize: 10.5,
    headingFontSize: 12,
    nameFontSize: 25,
    lineGap: 4,
    sectionSpacing: 0.8,
    pageMargin: 50,

    headerAlignment: "left",
    headerBackground: "tint",

    showSectionLines: true,
    dividerStyle: "solid",
    dividerThickness: 1,

    headingStyle: "uppercase",
    bulletStyle: "circle",
    skillsLayout: "inline",
    contactSeparator: "pipe",

    sectionOrder: [
      ...DEFAULT_SECTION_ORDER,
    ],

    hiddenSections: [],
  },
  classic: {
    accentColor: "#111827",
    fontFamily: "Helvetica",
    bodyFontSize: 10.5,
    headingFontSize: 12,
    nameFontSize: 24,
    lineGap: 4,
    sectionSpacing: 0.8,
    pageMargin: 50,

    headerAlignment: "center",
    headerBackground: "none",

    showSectionLines: true,
    dividerStyle: "solid",
    dividerThickness: 1,

    headingStyle: "uppercase",
    bulletStyle: "circle",
    skillsLayout: "comma-separated",
    contactSeparator: "pipe",

    sectionOrder: [
      ...DEFAULT_SECTION_ORDER,
    ],

    hiddenSections: [],
  },

  sidebar: {
    accentColor: "#d47706",
    fontFamily: "Helvetica",
    bodyFontSize: 9.8,
    headingFontSize: 11,
    nameFontSize: 21,
    lineGap: 3,
    sectionSpacing: 0.7,
    pageMargin: 50,

    headerAlignment: "left",
    headerBackground: "tint",

    showSectionLines: true,
    dividerStyle: "solid",
    dividerThickness: 1,

    headingStyle: "uppercase",
    bulletStyle: "circle",
    skillsLayout: "bullets",
    contactSeparator: "pipe",

    sectionOrder: [
      ...DEFAULT_SECTION_ORDER,
    ],

    hiddenSections: [],
  },
};

function getDefaultStyle(template) {
  const selectedTemplate =
    TEMPLATE_STYLE_DEFAULTS[template] ||
    TEMPLATE_STYLE_DEFAULTS.executive;

  return {
    ...selectedTemplate,

    sectionOrder: [
      ...selectedTemplate.sectionOrder,
    ],

    hiddenSections: [
      ...selectedTemplate.hiddenSections,
    ],
  };
}

function clampNumber(
  value,
  minimum,
  maximum,
  fallback
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(number, minimum),
    maximum
  );
}

function isValidHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(
    value || ""
  );
}

function getAllowedValue(
  value,
  allowedValues,
  fallback
) {
  return allowedValues.includes(value)
    ? value
    : fallback;
}

function normalizeSectionOrder(
  incomingOrder,
  fallbackOrder
) {
  if (!Array.isArray(incomingOrder)) {
    return [...fallbackOrder];
  }

  const validSections =
    incomingOrder.filter(
      (sectionName) =>
        ALLOWED_SECTIONS.includes(
          sectionName
        )
    );

  const uniqueSections = [
    ...new Set(validSections),
  ];

  if (uniqueSections.length === 0) {
    return [...fallbackOrder];
  }
  const missingSections =
    DEFAULT_SECTION_ORDER.filter(
      (sectionName) =>
        !uniqueSections.includes(
          sectionName
        )
    );

  return [
    ...uniqueSections,
    ...missingSections,
  ];
}

function normalizeHiddenSections(
  incomingHiddenSections,
  fallbackHiddenSections
) {
  if (
    !Array.isArray(
      incomingHiddenSections
    )
  ) {
    return [
      ...fallbackHiddenSections,
    ];
  }

  return [
    ...new Set(
      incomingHiddenSections.filter(
        (sectionName) =>
          ALLOWED_SECTIONS.includes(
            sectionName
          )
      )
    ),
  ];
}

function normalizeStyleConfig(
  incomingStyle = {},
  template = "executive"
) {
  const defaults =
    getDefaultStyle(template);

  return {
    accentColor: isValidHexColor(
      incomingStyle.accentColor
    )
      ? incomingStyle.accentColor
      : defaults.accentColor,

    fontFamily: getAllowedValue(
      incomingStyle.fontFamily,
      ALLOWED_FONTS,
      defaults.fontFamily
    ),

    bodyFontSize: clampNumber(
      incomingStyle.bodyFontSize,
      8,
      12,
      defaults.bodyFontSize
    ),

    headingFontSize: clampNumber(
      incomingStyle.headingFontSize,
      10,
      16,
      defaults.headingFontSize
    ),

    nameFontSize: clampNumber(
      incomingStyle.nameFontSize,
      17,
      30,
      defaults.nameFontSize
    ),

    lineGap: clampNumber(
      incomingStyle.lineGap,
      1,
      8,
      defaults.lineGap
    ),

    sectionSpacing: clampNumber(
      incomingStyle.sectionSpacing,
      0.2,
      1.8,
      defaults.sectionSpacing
    ),

    pageMargin: clampNumber(
      incomingStyle.pageMargin,
      35,
      70,
      defaults.pageMargin
    ),

    headerAlignment:
      getAllowedValue(
        incomingStyle.headerAlignment,
        ALLOWED_ALIGNMENTS,
        defaults.headerAlignment
      ),

    headerBackground:
      getAllowedValue(
        incomingStyle.headerBackground,
        ALLOWED_HEADER_BACKGROUNDS,
        defaults.headerBackground
      ),

    showSectionLines:
      typeof incomingStyle.showSectionLines ===
        "boolean"
        ? incomingStyle.showSectionLines
        : defaults.showSectionLines,

    dividerStyle:
      getAllowedValue(
        incomingStyle.dividerStyle,
        ALLOWED_DIVIDER_STYLES,
        defaults.dividerStyle
      ),

    dividerThickness: clampNumber(
      incomingStyle.dividerThickness,
      0.5,
      3,
      defaults.dividerThickness
    ),

    headingStyle:
      getAllowedValue(
        incomingStyle.headingStyle,
        ALLOWED_HEADING_STYLES,
        defaults.headingStyle
      ),

    bulletStyle:
      getAllowedValue(
        incomingStyle.bulletStyle,
        ALLOWED_BULLET_STYLES,
        defaults.bulletStyle
      ),

    skillsLayout:
      getAllowedValue(
        incomingStyle.skillsLayout,
        ALLOWED_SKILLS_LAYOUTS,
        defaults.skillsLayout
      ),

    contactSeparator:
      getAllowedValue(
        incomingStyle.contactSeparator,
        ALLOWED_CONTACT_SEPARATORS,
        defaults.contactSeparator
      ),

    sectionOrder:
      normalizeSectionOrder(
        incomingStyle.sectionOrder,
        defaults.sectionOrder
      ),

    hiddenSections:
      normalizeHiddenSections(
        incomingStyle.hiddenSections,
        defaults.hiddenSections
      ),
  };
}
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
  try {
    return JSON.parse(content);
  } catch (err) {
    console.log("AI match JSON parse error: ", err);
    console.log("AI returned: ", content);
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
async function customizeResumeStyleWithAI({
  instruction,
  currentStyle,
  template,
}) {
  const safeCurrentStyle =
    normalizeStyleConfig(
      currentStyle,
      template
    );

  const response =
    await client.responses.create({
      model: "gpt-5.4-mini",

      input: [
        {
          role: "system",
          content: `
You are an AI assistant for customizing a resume.

You can perform four kinds of operations:

1. "style"
Visual appearance changes such as:
- Accent colour
- Font family
- Body font size
- Heading font size
- Candidate name font size
- Line spacing
- Section spacing
- Page margins
- Header alignment
- Header background
- Section divider style and thickness
- Heading style
- Bullet style
- Skills presentation style
- Contact separator style

2. "layout"
Resume structure changes such as:
- Moving one section above or below another section
- Changing section order
- Hiding a section
- Showing a previously hidden section

3. "content"
Only these content operations are allowed:
- Add a skill
- Remove a skill

Content changes must require confirmation.

4. "unsupported"
Use this when the user requests something the application cannot safely perform, including:
- Adding, deleting, or rewriting experience
- Adding or deleting projects
- Adding education
- Rewriting the summary
- Inventing qualifications
- Changing factual resume content other than skills

Important rules:

- Never return JavaScript or PDFKit code.
- Never invent experience, education, certifications, achievements, or skills.
- Preserve every style property the user did not ask to change.
- Always return the complete styleConfig object.
- For a style or layout operation:
  - accepted must be true
  - requiresConfirmation must be false
  - contentChanges must be an empty array
- For a content operation:
  - accepted must be true
  - requiresConfirmation must be true
  - styleConfig must remain unchanged
  - contentChanges must contain add_skill or remove_skill operations
- For an unsupported operation:
  - accepted must be false
  - operationType must be "unsupported"
  - requiresConfirmation must be false
  - styleConfig must remain unchanged
  - contentChanges must be an empty array
- sectionOrder must always contain every supported section exactly once.
- Use hiddenSections to hide sections instead of removing them from sectionOrder.
- Keep the resume professional, readable, and ATS-friendly.

Supported sections:
- summary
- skills
- experience
- projects
- education
- certifications
- achievements

Allowed style values:

fontFamily:
- Helvetica
- Times-Roman
- Courier

headerAlignment:
- left
- center

headerBackground:
- none
- tint
- accent

dividerStyle:
- solid
- dotted
- dashed
- double
- short
- none

headingStyle:
- uppercase
- title-case
- left-border
- accent-block

bulletStyle:
- circle
- dash
- square
- arrow

skillsLayout:
- inline
- comma-separated
- bullets
- two-column

contactSeparator:
- pipe
- dot
- bullet
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({
            template,
            currentStyle:
              safeCurrentStyle,
            instruction,
          }),
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name:
            "resume_customization_result",
          strict: true,

          schema: {
            type: "object",
            additionalProperties: false,

            properties: {
              accepted: {
                type: "boolean",
              },

              operationType: {
                type: "string",
                enum: [
                  "style",
                  "layout",
                  "content",
                  "unsupported",
                ],
              },

              requiresConfirmation: {
                type: "boolean",
              },

              summary: {
                type: "string",
              },

              styleConfig: {
                type: "object",
                additionalProperties: false,

                properties: {
                  accentColor: {
                    type: "string",
                  },

                  fontFamily: {
                    type: "string",
                    enum: [
                      "Helvetica",
                      "Times-Roman",
                      "Courier",
                    ],
                  },

                  bodyFontSize: {
                    type: "number",
                  },

                  headingFontSize: {
                    type: "number",
                  },

                  nameFontSize: {
                    type: "number",
                  },

                  lineGap: {
                    type: "number",
                  },

                  sectionSpacing: {
                    type: "number",
                  },

                  pageMargin: {
                    type: "number",
                  },

                  headerAlignment: {
                    type: "string",
                    enum: [
                      "left",
                      "center",
                    ],
                  },

                  headerBackground: {
                    type: "string",
                    enum: [
                      "none",
                      "tint",
                      "accent",
                    ],
                  },

                  showSectionLines: {
                    type: "boolean",
                  },

                  dividerStyle: {
                    type: "string",
                    enum: [
                      "solid",
                      "dotted",
                      "dashed",
                      "double",
                      "short",
                      "none",
                    ],
                  },

                  dividerThickness: {
                    type: "number",
                  },

                  headingStyle: {
                    type: "string",
                    enum: [
                      "uppercase",
                      "title-case",
                      "left-border",
                      "accent-block",
                    ],
                  },

                  bulletStyle: {
                    type: "string",
                    enum: [
                      "circle",
                      "dash",
                      "square",
                      "arrow",
                    ],
                  },

                  skillsLayout: {
                    type: "string",
                    enum: [
                      "inline",
                      "comma-separated",
                      "bullets",
                      "two-column",
                    ],
                  },

                  contactSeparator: {
                    type: "string",
                    enum: [
                      "pipe",
                      "dot",
                      "bullet",
                    ],
                  },

                  sectionOrder: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "summary",
                        "skills",
                        "experience",
                        "projects",
                        "education",
                        "certifications",
                        "achievements",
                      ],
                    },
                  },

                  hiddenSections: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "summary",
                        "skills",
                        "experience",
                        "projects",
                        "education",
                        "certifications",
                        "achievements",
                      ],
                    },
                  },
                },

                required: [
                  "accentColor",
                  "fontFamily",
                  "bodyFontSize",
                  "headingFontSize",
                  "nameFontSize",
                  "lineGap",
                  "sectionSpacing",
                  "pageMargin",
                  "headerAlignment",
                  "headerBackground",
                  "showSectionLines",
                  "dividerStyle",
                  "dividerThickness",
                  "headingStyle",
                  "bulletStyle",
                  "skillsLayout",
                  "contactSeparator",
                  "sectionOrder",
                  "hiddenSections",
                ],
              },

              contentChanges: {
                type: "array",

                items: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    action: {
                      type: "string",
                      enum: [
                        "add_skill",
                        "remove_skill",
                      ],
                    },

                    value: {
                      type: "string",
                    },
                  },

                  required: [
                    "action",
                    "value",
                  ],
                },
              },
            },

            required: [
              "accepted",
              "operationType",
              "requiresConfirmation",
              "summary",
              "styleConfig",
              "contentChanges",
            ],
          },
        },
      },
    });

  const result = JSON.parse(
    response.output_text
  );

  const validOperationTypes = [
    "style",
    "layout",
    "content",
    "unsupported",
  ];

  const operationType =
    validOperationTypes.includes(
      result.operationType
    )
      ? result.operationType
      : "unsupported";

  const isStyleOperation =
    operationType === "style" ||
    operationType === "layout";

  const isContentOperation =
    operationType === "content";

  const isAccepted =
    result.accepted === true &&
    operationType !== "unsupported";

  const normalizedStyle =
    isStyleOperation && isAccepted
      ? normalizeStyleConfig(
          result.styleConfig,
          template
        )
      : safeCurrentStyle;

  const validContentChanges =
    isContentOperation &&
    isAccepted &&
    Array.isArray(
      result.contentChanges
    )
      ? result.contentChanges
          .filter((change) => {
            return (
              change &&
              [
                "add_skill",
                "remove_skill",
              ].includes(
                change.action
              ) &&
              typeof change.value ===
                "string" &&
              change.value.trim()
                .length > 0
            );
          })
          .map((change) => ({
            action: change.action,
            value:
              change.value.trim(),
          }))
      : [];
  const finalAccepted =
    isContentOperation
      ? isAccepted &&
        validContentChanges.length > 0
      : isAccepted;

  return {
    accepted: finalAccepted,

    operationType:
      finalAccepted
        ? operationType
        : "unsupported",

    requiresConfirmation:
      finalAccepted &&
      isContentOperation,

    summary:
      typeof result.summary ===
        "string" &&
      result.summary.trim()
        ? result.summary.trim()
        : finalAccepted
          ? "Your resume has been updated."
          : "That change is not currently supported.",

    styleConfig:
      normalizedStyle,

    contentChanges:
      validContentChanges,
  };
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
    model: "gpt-5.4-mini",
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
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    const plan = String(user.plan || "free")
      .trim()
      .toLowerCase();
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked."
      })
    }
    if (user.plan === "free" && user.freeUsesLeft <= 0) {
      return res.status(403).json({
        message: "Your free trial is over. Please upgrade to pro.",
      });
    }
    if (user.plan === "pro" && user.proUsesLeft <= 0) {
      return res.status(403).json({
        messsage: "Your pro credits are over. Please purchase again"
      })
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
    const matchAnalysis = await analyzeResumeMatch({ resumeData, jobDescription, skills, userLocation: user.location || "Not provided" })
    res.json({
      message: "AI resume sections generated successfully",
      resumeData,
      matchAnalysis,
      originalFileName: resumeFile.originalname,
      originalFilePath: resumeFile.path,
      jobDescription,
      skills,
    });
    if (user.plan === "free") {
      user.freeUsesLeft -= 1
    }
    if (user.plan === "pro") {
      user.proUsesLeft -= 1;
    }
    user.totalUses += 1;

    await user.save();
  } catch (err) {
    console.log("Analyze resume error:", err);
    res.status(500).json({
      message: err.message || "Something went wrong while analyzing resume",
    });
  }
}
);
router.post("/customize-design", authenticateToken, async (req, res) => {
  try {
    const { instruction, currentStyle, template } = req.body;
    if (!instruction || !instruction.trim()) {
      return res.status(400).json({
        message:
          "A design instruction is required",
      });
    }
    const selectedTemplate = template || "executive";
    const result = await customizeResumeStyleWithAI({
      instruction: instruction.trim(),
      currentStyle,
      template: selectedTemplate,
    });
    return res.json(result);
  } catch (err) {
    console.log("Customize resume design error:", err);
    return res.status(500).json({
      message:
        "Could not customize the resume design",
    });
  }
}
);
router.post("/generate-pdf", authenticateToken, async (req, res) => {
  try {
    const {
      resumeData,
      template,
      styleConfig,
      saveToHistory = true,
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
    const finalStyleConfig =
      normalizeStyleConfig(
        styleConfig,
        selectedTemplate
      );
    const generatedFolder = path.join(__dirname, "..", "generated");
    ensureFolder(generatedFolder);
    const generatedFileName = `resume-${Date.now()}.pdf`;
    const generatedPdfPath = path.join(generatedFolder, generatedFileName);
    const doc = new PDFDocument({
      size: "A4",
      margin: finalStyleConfig.pageMargin,
    });
    const stream = fs.createWriteStream(generatedPdfPath);
    doc.pipe(stream);
    console.log(
      "FINAL STYLE CONFIG:",
      finalStyleConfig
    );
    console.log(
      "SECTION ORDER:",
      finalStyleConfig.sectionOrder
    );
    console.log(
      "RESUME DATA KEYS:",
      Object.keys(resumeData || {})
    );
    applyResumeTemplate(doc, selectedTemplate, resumeData, finalStyleConfig);
    doc.end();

    stream.on("finish", async () => {
      const generatedPdfUrl = `http://localhost:5000/generated/${generatedFileName}`;
      if (saveToHistory !== false) {
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
      }
      res.json({
        message: "Final PDF generated successfully",
        pdfUrl: generatedPdfUrl,
        styleConfig: finalStyleConfig
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
router.delete("/my-resumes/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const resume = await Resume.findOne({
      where: {
        id: id,
        userId: req.user.id
      }
    });
    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or you are not allowed to delete it",
      });
    }
    if (resume.originalFilePath) {
      try {
        const originalPath = path.resolve(resume.originalFilePath);
        await fs.promises.unlink(originalPath);
        console.log("Original Resume deleted:", originalPath);
      } catch (fileError) {
        if (fileError !== "ENOENT") {
          console.log("Could not delete original resume:", fileError);
        }
      }
    }
    if (resume.generatedPdfPath) {
      try {
        const generatedPath = path.resolve(resume.generatedPdfPath);
        await fs.promises.unlink(generatedPath);
        console.log("Generated PDF deleted", generatedPath);
      } catch (fileError) {
        if (fileError.code !== "ENOENT") {
          console.log("Could not delete generated PDF:", fileError);
        }
      }
    }
    resume.destroy();
    res.status(200).json({ message: "Successfully deleted the resume" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})
module.exports = router;