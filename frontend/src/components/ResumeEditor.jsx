import React from "react";

function ResumeEditor({ resumeData, setResumeData }) {
  function updateField(field, value) {
    setResumeData({
      ...resumeData,
      [field]: value,
    });
  }

  function updateArrayItem(section, index, value) {
    const updated = [...resumeData[section]];
    updated[index] = value;

    setResumeData({
      ...resumeData,
      [section]: updated,
    });
  }

  function addArrayItem(section, emptyValue = "") {
    setResumeData({
      ...resumeData,
      [section]: [...(resumeData[section] || []), emptyValue],
    });
  }

  function removeArrayItem(section, index) {
    const updated = [...resumeData[section]];
    updated.splice(index, 1);

    setResumeData({
      ...resumeData,
      [section]: updated,
    });
  }

  function updateNested(section, index, field, value) {
    const updated = [...resumeData[section]];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setResumeData({
      ...resumeData,
      [section]: updated,
    });
  }

  function updateBullet(section, expIndex, bulletIndex, value) {
    const updated = [...resumeData[section]];

    const bullets = [...(updated[expIndex].bullets || [])];
    bullets[bulletIndex] = value;

    updated[expIndex] = {
      ...updated[expIndex],
      bullets,
    };

    setResumeData({
      ...resumeData,
      [section]: updated,
    });
  }

  function addBullet(section, expIndex) {
    const updated = [...resumeData[section]];

    updated[expIndex] = {
      ...updated[expIndex],
      bullets: [...(updated[expIndex].bullets || []), ""],
    };

    setResumeData({
      ...resumeData,
      [section]: updated,
    });
  }

  function removeBullet(section, expIndex, bulletIndex) {
    const updated = [...resumeData[section]];
    const bullets = [...(updated[expIndex].bullets || [])];

    bullets.splice(bulletIndex, 1);

    updated[expIndex] = {
      ...updated[expIndex],
      bullets,
    };

    setResumeData({
      ...resumeData,
      [section]: updated,
    });
  }

  return (
    <div className="resume-editor">
      <div className="editor-heading">
        <p className="eyebrow">Review</p>
        <h2>Edit Resume Sections</h2>
        <p>
          Review the AI-created sections, make changes, then generate your final PDF.
        </p>
      </div>

      <div className="editor-card">
        <label className="input-label">Full Name</label>
        <input
          className="editor-input"
          value={resumeData.fullName || ""}
          onChange={(e) => updateField("fullName", e.target.value)}
        />
      </div>

      <div className="editor-card">
        <label className="input-label">Professional Title</label>
        <input
          className="editor-input"
          value={resumeData.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="editor-grid-2">
        <div className="editor-card">
          <label className="input-label">Email</label>
          <input
            className="editor-input"
            value={resumeData.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div className="editor-card">
          <label className="input-label">Phone</label>
          <input
            className="editor-input"
            value={resumeData.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="editor-grid-2">
        <div className="editor-card">
          <label className="input-label">Location</label>
          <input
            className="editor-input"
            value={resumeData.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>

        <div className="editor-card">
          <label className="input-label">LinkedIn</label>
          <input
            className="editor-input"
            value={resumeData.linkedin || ""}
            onChange={(e) => updateField("linkedin", e.target.value)}
          />
        </div>
      </div>

      <div className="editor-card">
        <label className="input-label">Portfolio / GitHub</label>
        <input
          className="editor-input"
          value={resumeData.portfolio || ""}
          onChange={(e) => updateField("portfolio", e.target.value)}
        />
      </div>

      <div className="editor-card">
        <label className="input-label">Professional Summary</label>
        <textarea
          className="editor-textarea"
          value={resumeData.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
        />
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Skills</label>
          <button
            type="button"
            className="mini-btn"
            onClick={() => addArrayItem("skills", "")}
          >
            Add Skill
          </button>
        </div>

        {(resumeData.skills || []).map((skill, index) => (
          <div className="editor-row" key={index}>
            <input
              className="editor-input"
              value={skill}
              onChange={(e) => updateArrayItem("skills", index, e.target.value)}
            />

            <button
              type="button"
              className="remove-small-btn"
              onClick={() => removeArrayItem("skills", index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Experience</label>
          <button
            type="button"
            className="mini-btn"
            onClick={() =>
              addArrayItem("experience", {
                role: "",
                company: "",
                duration: "",
                bullets: [""],
              })
            }
          >
            Add Experience
          </button>
        </div>

        {(resumeData.experience || []).map((exp, expIndex) => (
          <div className="nested-block" key={expIndex}>
            <input
              className="editor-input"
              placeholder="Role"
              value={exp.role || ""}
              onChange={(e) =>
                updateNested("experience", expIndex, "role", e.target.value)
              }
            />

            <input
              className="editor-input"
              placeholder="Company"
              value={exp.company || ""}
              onChange={(e) =>
                updateNested("experience", expIndex, "company", e.target.value)
              }
            />

            <input
              className="editor-input"
              placeholder="Duration"
              value={exp.duration || ""}
              onChange={(e) =>
                updateNested("experience", expIndex, "duration", e.target.value)
              }
            />

            <p className="small-label">Bullets</p>

            {(exp.bullets || []).map((bullet, bulletIndex) => (
              <div className="editor-row" key={bulletIndex}>
                <textarea
                  className="editor-textarea small-textarea"
                  value={bullet}
                  onChange={(e) =>
                    updateBullet(
                      "experience",
                      expIndex,
                      bulletIndex,
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="remove-small-btn"
                  onClick={() =>
                    removeBullet("experience", expIndex, bulletIndex)
                  }
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              className="mini-btn"
              onClick={() => addBullet("experience", expIndex)}
            >
              Add Bullet
            </button>

            <button
              type="button"
              className="remove-section-btn"
              onClick={() => removeArrayItem("experience", expIndex)}
            >
              Remove Experience
            </button>
          </div>
        ))}
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Projects</label>
          <button
            type="button"
            className="mini-btn"
            onClick={() =>
              addArrayItem("projects", {
                name: "",
                description: "",
              })
            }
          >
            Add Project
          </button>
        </div>

        {(resumeData.projects || []).map((project, index) => (
          <div className="nested-block" key={index}>
            <input
              className="editor-input"
              placeholder="Project name"
              value={project.name || ""}
              onChange={(e) =>
                updateNested("projects", index, "name", e.target.value)
              }
            />

            <textarea
              className="editor-textarea"
              placeholder="Project description"
              value={project.description || ""}
              onChange={(e) =>
                updateNested("projects", index, "description", e.target.value)
              }
            />

            <button
              type="button"
              className="remove-section-btn"
              onClick={() => removeArrayItem("projects", index)}
            >
              Remove Project
            </button>
          </div>
        ))}
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Education</label>
          <button
            type="button"
            className="mini-btn"
            onClick={() =>
              addArrayItem("education", {
                degree: "",
                institution: "",
                year: "",
              })
            }
          >
            Add Education
          </button>
        </div>

        {(resumeData.education || []).map((edu, index) => (
          <div className="nested-block" key={index}>
            <input
              className="editor-input"
              placeholder="Degree"
              value={edu.degree || ""}
              onChange={(e) =>
                updateNested("education", index, "degree", e.target.value)
              }
            />

            <input
              className="editor-input"
              placeholder="Institution"
              value={edu.institution || ""}
              onChange={(e) =>
                updateNested("education", index, "institution", e.target.value)
              }
            />

            <input
              className="editor-input"
              placeholder="Year"
              value={edu.year || ""}
              onChange={(e) =>
                updateNested("education", index, "year", e.target.value)
              }
            />

            <button
              type="button"
              className="remove-section-btn"
              onClick={() => removeArrayItem("education", index)}
            >
              Remove Education
            </button>
          </div>
        ))}
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Certifications</label>
          <button
            type="button"
            className="mini-btn"
            onClick={() => addArrayItem("certifications", "")}
          >
            Add Certification
          </button>
        </div>

        {(resumeData.certifications || []).map((cert, index) => (
          <div className="editor-row" key={index}>
            <input
              className="editor-input"
              value={cert}
              onChange={(e) =>
                updateArrayItem("certifications", index, e.target.value)
              }
            />

            <button
              type="button"
              className="remove-small-btn"
              onClick={() => removeArrayItem("certifications", index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Achievements</label>
          <button
            type="button"
            className="mini-btn"
            onClick={() => addArrayItem("achievements", "")}
          >
            Add Achievement
          </button>
        </div>

        {(resumeData.achievements || []).map((achievement, index) => (
          <div className="editor-row" key={index}>
            <input
              className="editor-input"
              value={achievement}
              onChange={(e) =>
                updateArrayItem("achievements", index, e.target.value)
              }
            />

            <button
              type="button"
              className="remove-small-btn"
              onClick={() => removeArrayItem("achievements", index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumeEditor;