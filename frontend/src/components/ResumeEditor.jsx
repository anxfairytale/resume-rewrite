import React from "react";
import { useState } from "react";
import authApi, { BASE_URL } from "../services/api";
import { toast } from "react-toastify";
function ResumeEditor({ resumeData, setResumeData }) {
  const [improvingField, setImprovingField] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  async function improveField(fieldName, currentText) {
    try {
      if (!currentText || !currentText.trim()) {
        toast.error("There is no text to improve");
        return;
      }

      setImprovingField(fieldName);

      const token = localStorage.getItem("token");

      const res = await authApi.post(
        "/resume/improve-field",
        {
          fieldName,
          text: currentText,
          instruction: "Make this resume field more professional and ATS-friendly",
        },
      );

      setSuggestions({
        ...suggestions,
        [fieldName]: res.data.improvedText,
      });
    } catch (err) {
      console.log(err);
      toast.error("Could not improve this field");
    } finally {
      setImprovingField(null);
    }
  }
  async function improveArrayItem(section, index, currentText) {
    try {
      if (!currentText || !currentText.trim()) {
        toast.error("There is no text to improve");
        return;
      }
      const fieldKey = `${section}-${index}`;
      setImprovingField(fieldKey);
      const token = localStorage.getItem("token");
      const res = await authApi.post("/resume/improve-field",
        {
          fieldName: section,
          text: currentText,
          instruction: "Rewrite this resume bullet to sound stronger, clearer, and ATS-friendly",
        },
      );
      setSuggestions({
        ...suggestions,
        [fieldKey]: res.data.improvedText,
      });
    } catch (err) {
      console.log(err);
      toast.error("Could not improve this line");
    } finally {
      setImprovingField(null);
    }
  }
  async function improveBullet(section, itemIndex, bulletIndex, currentText) {
    try {
      if (!currentText || !currentText.trim()) {
        toast.error("There is no text to improve");
        return;
      }
      const fieldKey = `${section}-${itemIndex}-bullet-${bulletIndex}`;
      setImprovingField(fieldKey);
      const token = localStorage.getItem("token");
      const res = await authApi.post(
        "/resume/improve-field",
        {
          fieldName: `${section} bullet`,
          text: currentText,
          instruction:
            "Rewrite this resume bullet with a stronger action verb, clearer impact, and ATS-friendly wording. Do not invent numbers or fake achievements.",
        },
      );
      setSuggestions({
        ...suggestions,
        [fieldKey]: res.data.improvedText,
      });
    } catch (err) {
      console.log(err);
      toast.error("Could not improve this bullet");
    } finally {
      setImprovingField(null);
    }
  }
  async function improveNestedField(section, index, key, currentText) {
    try {
      if (!currentText || !currentText.trim()) {
        toast.error("There is no text to improve");
        return;
      }

      const fieldKey = `${section}-${index}-${key}`;
      setImprovingField(fieldKey);

      const token = localStorage.getItem("token");

      const res = await authApi.post(
        "/resume/improve-field",
        {
          fieldName: `${section} ${key}`,
          text: currentText,
          instruction:
            "Improve this resume field so it is clear, professional, concise, and ATS-friendly. Do not invent fake details.",
        },
      );
      setSuggestions({
        ...suggestions,
        [fieldKey]: res.data.improvedText,
      });
    } catch (err) {
      console.log(err);
      toast.error("Could not improve this field");
    } finally {
      setImprovingField(null);
    }
  }
  function applyNestedSuggestion(section, index, key) {
    const fieldKey = `${section}-${index}-${key}`;

    updateNested(section, index, key, suggestions[fieldKey]);

    setSuggestions({
      ...suggestions,
      [fieldKey]: "",
    });
  }
  function applyBulletSuggestion(section, itemIndex, bulletIndex) {
    const fieldKey = `${section}-${itemIndex}-bullet-${bulletIndex}`;

    updateBullet(section, itemIndex, bulletIndex, suggestions[fieldKey]);

    setSuggestions({
      ...suggestions,
      [fieldKey]: "",
    });
  }
  function applyArraySuggestion(section, index) {
    const fieldKey = `${section}-${index}`;
    updateArrayItem(section, index, suggestions[fieldKey]);
    setSuggestions({ ...suggestions, [fieldKey]: "" });
  }
  function applySuggestion(fieldName) {
    setResumeData({
      ...resumeData,
      [fieldName]: suggestions[fieldName]
    });
    setSuggestions({
      ...suggestions,
      [fieldName]: ""
    })
  }
  function dismissSuggestion(fieldName) {
    setSuggestions({
      ...suggestions,
      [fieldName]: "",
    })
  }
  function renderSuggestion(fieldKey, onApply) {
    if (!suggestions[fieldKey]) return null;
    return (
      <div className="ai-suggestion-box">
        <p className="ai-suggestion-label">AI suggestion</p>
        <p className="ai-suggestion-text">{suggestions[fieldKey]}</p>
        <div className="ai-suggestion-actions">
          <button type="button" className="suggestion-btn suggestion-btn-apply" onClick={onApply}>
            Apply
          </button>

          <button
            type="button"
            className="suggestion-btn suggestion-btn-dismiss"
            onClick={() => dismissSuggestion(fieldKey)}
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }
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
      [section]: [emptyValue, ...(resumeData[section] || [])],
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
      <div className="editor-card">
        <label className="input-label">Full Name</label>
        <input
          className="editor-input"
          value={resumeData.fullName || ""}
          onChange={(e) => updateField("fullName", e.target.value)}
        />
      </div>

      <div className="editor-card">
        <div className="editor-section-top">
          <label className="input-label">Professional Title</label>
          <button type="button" className="ai-btn" onClick={() => improveField("title", resumeData.title || "")}
            disabled={improvingField === "title"}>{improvingField === "title" ? "Improving" : "AI Improve"}</button>
        </div>

        <input
          className="editor-input"
          value={resumeData.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
        {renderSuggestion("title", () => applySuggestion("title"))}
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
        <div className="editor-section-top">
          <label className="input-label">Professional Summary</label>
          <button type="button" className="ai-btn" onClick={() => improveField("summary", resumeData.summary || "")}
            disabled={improvingField === "summary"}>{improveField === "summary" ? "Improving" : "AI Improve"}</button>
        </div>

        <textarea
          className="editor-textarea"
          value={resumeData.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
        />
        {renderSuggestion("summary", () => applySuggestion("summary"))}
      </div>

      <div className="editor-card skills-editor-card">
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
        <div className="skills-scroll-area">
          {(resumeData.skills || []).map((skill, index) => (
            <div key={index} className="array-item-block">
              <div className="editor-row">
                <input
                  className="editor-input"
                  value={skill}
                  onChange={(e) => updateArrayItem("skills", index, e.target.value)}
                />
                <button type="button" className="ai-btn small-ai-btn"
                  onClick={() => improveArrayItem("skills", index, skill)}
                  disabled={improvingField === `skills-${index}`}>{improvingField === `skills-${index}` ? "..." : "✦"}</button>
                <button
                  type="button"
                  className="remove-small-btn"
                  onClick={() => removeArrayItem("skills", index)}
                >
                  ×
                </button>
              </div>
              {renderSuggestion(`skills-${index}`, () =>
                applyArraySuggestion("skills", index)
              )}
            </div>
          ))}
        </div>
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
        <div className="section-scroll-area">
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

              {(exp.bullets || []).map((bullet, bulletIndex) => {
                const fieldKey = `experience-${expIndex}-bullet-${bulletIndex}`;

                return (
                  <div key={bulletIndex} className="array-item-block">
                    <div className="editor-row">
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
                        className="ai-btn small-ai-btn"
                        onClick={() =>
                          improveBullet("experience", expIndex, bulletIndex, bullet)
                        }
                        disabled={improvingField === fieldKey}
                      >
                        {improvingField === fieldKey ? "..." : "✦"}
                      </button>

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

                    {renderSuggestion(fieldKey, () =>
                      applyBulletSuggestion("experience", expIndex, bulletIndex)
                    )}
                  </div>
                );
              })}

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
            <div className="section-scroll-area">
              {(resumeData.projects || []).map((project, index) => {
          const fieldKey = `projects-${index}-description`;

          return (
            <div className="nested-block" key={index}>
              <input
                className="editor-input"
                placeholder="Project name"
                value={project.name || ""}
                onChange={(e) =>
                  updateNested("projects", index, "name", e.target.value)
                }
              />

              <div className="editor-section-top">
                <p className="small-label">Project description</p>

                <button
                  type="button"
                  className="ai-btn small-ai-btn"
                  onClick={() =>
                    improveNestedField(
                      "projects",
                      index,
                      "description",
                      project.description || ""
                    )
                  }
                  disabled={improvingField === fieldKey}
                >
                  {improvingField === fieldKey ? "Improving..." : "AI Improve"}
                </button>
              </div>

              <textarea
                className="editor-textarea"
                placeholder="Project description"
                value={project.description || ""}
                onChange={(e) =>
                  updateNested("projects", index, "description", e.target.value)
                }
              />

              {renderSuggestion(fieldKey, () =>
                applyNestedSuggestion("projects", index, "description")
              )}

              <button
                type="button"
                className="remove-section-btn"
                onClick={() => removeArrayItem("projects", index)}
              >
                Remove Project
              </button>
            </div>
          );
        })}
            </div>
        
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
        <div className="section-scroll-area">{(resumeData.certifications || []).map((cert, index) => (
          <div key={index} className="array-item-block">
            <div className="editor-row" key={index}>
              <input
                className="editor-input"
                value={cert}
                onChange={(e) =>
                  updateArrayItem("certifications", index, e.target.value)
                }
              />
              <button type="button" className="ai-btn small-ai-btn"
                onClick={() => improveArrayItem("certifications", index, cert)}
                disabled={improvingField === `certifications-${index}`}>
                {improvingField === `certifications-${index}` ? "..." : "✦"}
              </button>
              <button
                type="button"
                className="remove-small-btn"
                onClick={() => removeArrayItem("certifications", index)}
              >
                ×
              </button>
            </div>
            {renderSuggestion(`certifications-${index}`, () => applyArraySuggestion("certifications", index))}
          </div>
        ))}
        </div>
        
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
        <div className="section-scroll-area">
        {(resumeData.achievements || []).map((achievement, index) => (
          <div className="array-item-block" key={index}>
            <div className="editor-row">
              <input
                className="editor-input"
                value={achievement}
                onChange={(e) =>
                  updateArrayItem("achievements", index, e.target.value)
                }
              />
              <button
                type="button"
                className="ai-btn small-ai-btn"
                onClick={() => improveArrayItem("achievements", index, achievement)}
                disabled={improvingField === `achievements-${index}`}
              >
                {improvingField === `achievements-${index}` ? "..." : "✦"}
              </button>
              <button
                type="button"
                className="remove-small-btn"
                onClick={() => removeArrayItem("achievements", index)}
              >
                ×
              </button>
            </div>
            {renderSuggestion(`achievements-${index}`, () =>
              applyArraySuggestion("achievements", index)
            )}
          </div>
        ))}
        </div>
        
      </div>
    </div>
  );
}

export default ResumeEditor;