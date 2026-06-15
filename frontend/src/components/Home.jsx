import React, { useState } from "react";
import "../styles/Home.css";
import FileUpload from "./FileUpload";
import ResumeEditor from "./ResumeEditor";
import axios from "axios";

function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [termCheck, setTermCheck] = useState(false);
  const [dial, setDial] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState("executive");

  const [resumeData, setResumeData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [resumeMeta, setResumeMeta] = useState({
    originalFileName: "",
    originalFilePath: "",
    jobDescription: "",
    skills: "",
  });

  async function handleAnalyzeResume() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before generating a resume.");
      window.location.href = "/login";
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste the job description first.");
      return;
    }

    if (!resumeFile) {
      alert("Please upload your resume PDF first.");
      return;
    }

    if (!termCheck) {
      alert("Please accept the terms and conditions.");
      return;
    }

    try {
      setAnalyzing(true);
      setPdfUrl("");

      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      formData.append("skills", skills);
      formData.append("resume", resumeFile);

      const response = await axios.post(
        "http://localhost:5000/resume/analyze",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResumeData(response.data.resumeData);

      setResumeMeta({
        originalFileName: response.data.originalFileName,
        originalFilePath: response.data.originalFilePath,
        jobDescription: response.data.jobDescription,
        skills: response.data.skills,
      });
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Something went wrong while analyzing the resume.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerateFinalPdf() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    if (!resumeData) {
      alert("Please generate and review resume sections first.");
      return;
    }

    try {
      setGeneratingPdf(true);

      const response = await axios.post(
        "http://localhost:5000/resume/generate-pdf",
        {
          resumeData,
          template: selectedTemplate,
          originalFileName: resumeMeta.originalFileName,
          originalFilePath: resumeMeta.originalFilePath,
          jobDescription: resumeMeta.jobDescription,
          skills: resumeMeta.skills,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPdfUrl(response.data.pdfUrl);
      alert("Final PDF generated successfully.");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Something went wrong while generating PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div className="home-page">
      <main className="main-page">
        <section className="left-section">
          {dial && (
            <div className="modal-backdrop">
              <dialog className="terms-dialog" open>
                <div className="terms-header">
                  <h1>Terms and Conditions</h1>
                </div>

                <div className="terms-content">
                  <p>
                    TERMS AND CONDITIONS
                    {"\n\n"}
                    Last Updated: 12 June 2026
                    {"\n\n"}
                    Welcome to 2xResume. By using this website, uploading your resume,
                    or generating a rewritten resume, you agree to the Terms and
                    Conditions.
                    {"\n\n"}
                    This service helps users prepare resumes. It does not guarantee
                    employment, interview selection, job offers, or career outcomes.
                    {"\n\n"}
                    You are responsible for reviewing the generated resume before using
                    it. Avoid uploading sensitive data such as government IDs, bank
                    details, passwords, financial information, or medical records.
                  </p>
                </div>

                <div className="terms-footer">
                  <button onClick={() => setDial(false)}>OK</button>
                </div>
              </dialog>
            </div>
          )}

          <div className="section-heading">
            <p className="eyebrow">Step 1</p>
            <h2>Fill in the details</h2>
            <p>
              Paste the job description, upload your resume, and add key skills.
              Then review editable AI-created sections before generating the PDF.
            </p>
          </div>

          <div className="form-card">
            <label className="input-label">Job opening / description</label>
            <textarea
              className="job-description"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <div className="helper-row">
              <span>{jobDescription.length} characters</span>
              <span>Tip: Paste the full job post for better results</span>
            </div>
          </div>

          <FileUpload resumeFile={resumeFile} setResumeFile={setResumeFile} />

          <div className="form-card">
            <label className="input-label">Key skills / notes</label>
            <textarea
              className="skills-input"
              placeholder="Example: React, Node.js, MySQL, internship project..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="form-card">
            <label className="input-label">Choose Resume Template</label>

            <div className="template-grid">
              <button
                type="button"
                className={`template-card ${
                  selectedTemplate === "executive" ? "active-template" : ""
                }`}
                onClick={() => setSelectedTemplate("executive")}
              >
                <div className="template-preview modern-template-preview">
                  <div></div>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <h3>Executive Orange</h3>
                <p>Elegant, warm, employer-catching.</p>
              </button>

              <button
                type="button"
                className={`template-card ${
                  selectedTemplate === "classic" ? "active-template" : ""
                }`}
                onClick={() => setSelectedTemplate("classic")}
              >
                <div className="template-preview classic-template-preview">
                  <div></div>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <h3>Classic ATS</h3>
                <p>Clean, simple, traditional.</p>
              </button>

              <button
                type="button"
                className={`template-card ${
                  selectedTemplate === "sidebar" ? "active-template" : ""
                }`}
                onClick={() => setSelectedTemplate("sidebar")}
              >
                <div className="template-preview sidebar-template-preview">
                  <div></div>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <h3>Modern Sidebar</h3>
                <p>Stylish split resume layout.</p>
              </button>
            </div>
          </div>

          <div className="form-card">
            <input
              type="checkbox"
              checked={termCheck}
              onChange={(e) => setTermCheck(e.target.checked)}
            />{" "}
            I agree to the Terms & Conditions.{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setDial(true)}
            >
              Learn more
            </span>

            {!termCheck && (
              <p style={{ color: "red" }}>
                You must accept the terms and conditions to proceed.
              </p>
            )}
          </div>

          <button
            className="generate-btn"
            onClick={handleAnalyzeResume}
            disabled={!termCheck || analyzing}
          >
            {analyzing ? "Creating Editable Sections..." : "Rewrite Resume"}
          </button>

          {resumeData && (
            <button
              className="generate-btn final-pdf-btn"
              onClick={handleGenerateFinalPdf}
              disabled={generatingPdf}
            >
              {generatingPdf ? "Generating Final PDF..." : "Generate Final PDF"}
            </button>
          )}
        </section>

        <section className="right-section">
          <div className="preview-header">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>{pdfUrl ? "PDF Preview" : "Review Resume"}</h2>
            </div>

            {pdfUrl ? (
              <a
                className="download-btn"
                href={pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
              >
                Download PDF
              </a>
            ) : (
              <button className="download-btn" disabled>
                Download
              </button>
            )}
          </div>

          <div className={`preview-box ${pdfUrl ? "pdf-preview-box" : ""}`}>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Generated Resume Preview"
                className="pdf-preview-frame"
              />
            ) : resumeData ? (
              <ResumeEditor resumeData={resumeData} setResumeData={setResumeData} />
            ) : (
              <div className="empty-preview">
                <div className="empty-icon">📄</div>
                <h3>Your editable resume sections will appear here</h3>
                <p>
                  After you paste a job description and upload your resume,
                  click “Rewrite Resume” to review and edit the generated sections.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;