import React, { useState } from "react";
import "../styles/Home.css";
import FileUpload from "./FileUpload";
import axios from "axios";
import { useNavigate } from "react-router-dom"
function Home() {
    const [jobDescription, setJobDescription] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [skills, setSkills] = useState("");
    const [previewText, setPreviewText] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [termCheck, setTermCheck] = useState(false);
    const [dial, setDial] = useState(false)
    const [generate, setGenerate] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState("modern");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }
    async function handleGenerateResume() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login before generating a resume.");
            window.location.href = "/";
            return;
        }
        try {
            setGenerate(true)
            if (!jobDescription.trim()) {
                alert("Please paste the job description first.");
                return;
            }

            if (!resumeFile) {
                alert("Please upload your resume PDF first.");
                return;
            }
            const formData = new FormData();
            formData.append("jobDescription", jobDescription);
            formData.append("skills", skills);
            formData.append("resume", resumeFile);
            formData.append("consent", termCheck);
            formData.append("template", selectedTemplate);
            const response = await axios.post("http://localhost:5000/resume/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response.data);
            setPreviewText(response.data.rewrittenResume);
            setPdfUrl(response.data.pdfUrl)
            setGenerate(false);
        } catch (err) {
            console.log(err)
            alert("Something went wrong while uploading the resume")
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
                                        Welcome to 2xResume. By using this website, uploading your resume, or generating a rewritten resume, you agree to the following Terms and Conditions.
                                        {"\n\n"}
                                        1. Purpose of the Website
                                        {"\n\n"}
                                        2xResume provides a resume rewriting and formatting service. The website allows users to upload resume-related information and generate an improved resume output based on the details provided.
                                        {"\n\n"}
                                        This service is intended to assist users with resume preparation. It does not guarantee employment, interview selection, job offers, or any specific career outcome.
                                        {"\n\n"}
                                        2. User Responsibility
                                        {"\n\n"}
                                        By using this website, you agree that:
                                        {"\n\n"}
                                        - The information you provide is accurate and belongs to you.
                                        {"\n"}
                                        - You will not upload false, misleading, offensive, illegal, or unauthorized content.
                                        {"\n"}
                                        - You are responsible for reviewing the generated resume before using or sharing it.
                                        {"\n"}
                                        - You understand that the generated resume may require manual correction or editing.
                                        {"\n\n"}
                                        3. Personal Information and Resume Data
                                        {"\n\n"}
                                        To generate a resume, this website may collect information such as your name, email address, education details, work experience, skills, projects, achievements, job description, and uploaded resume file.
                                        {"\n\n"}
                                        This information may be considered personal information. By using this website, you consent to the collection and processing of this information only for the purpose of generating or improving your resume.
                                        {"\n\n"}
                                        4. Uploaded Files
                                        {"\n\n"}
                                        When you upload a resume or related document, you confirm that:
                                        {"\n\n"}
                                        - You have the right to upload and use the file.
                                        {"\n"}
                                        - The file does not contain content that violates any law or the rights of another person.
                                        {"\n"}
                                        - You understand that uploaded files may be temporarily stored on the server for processing.
                                        {"\n\n"}
                                        We recommend that you do not upload sensitive personal details unless required for your resume.
                                        {"\n\n"}
                                        5. Sensitive Information
                                        {"\n\n"}
                                        You should avoid uploading highly sensitive information such as government identification numbers, bank details, passwords, financial information, medical records, or any information not required for resume generation.
                                        {"\n\n"}
                                        2xResume is not responsible for any sensitive information voluntarily uploaded by the user.
                                        {"\n\n"}
                                        6. Data Usage
                                        {"\n\n"}
                                        The information you provide will be used for generating or rewriting your resume, improving the resume output, and allowing download of the generated resume.
                                        {"\n\n"}
                                        We will not intentionally sell your personal resume data to third parties.
                                        {"\n\n"}
                                        7. Data Storage and Deletion
                                        {"\n\n"}
                                        Uploaded resumes and generated files may be stored temporarily for processing and access purposes.
                                        {"\n\n"}
                                        You may request deletion of your uploaded or generated resume data by contacting us at [Your Contact Email].
                                        {"\n\n"}
                                        8. Resume Output Accuracy
                                        {"\n\n"}
                                        The generated resume is created based on the information provided by the user. We do not guarantee that the resume will be error-free, fully accurate, ATS-approved, recruiter-approved, or suitable for every job application.
                                        {"\n\n"}
                                        9. No Employment Guarantee
                                        {"\n\n"}
                                        Using this website does not guarantee job placement, interview calls, employer responses, career advancement, salary increase, or resume acceptance.
                                        {"\n\n"}
                                        10. Contact Us
                                        {"\n\n"}
                                        For questions, concerns, or data deletion requests, contact us at [Your Contact Email].
                                        {"\n\n"}
                                        By checking the “I agree to the Terms and Conditions” checkbox, you confirm that you have read, understood, and agreed to these Terms and Conditions.
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
                            Paste the job description, upload your resume, and add any key
                            skills you want the AI to consider.
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
                            placeholder="Example: React, Node.js, MySQL, internship project, admin dashboard..."
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                    </div>
                    <div className="form-card">
                        <input type="checkbox" checked={termCheck} onChange={(e) => setTermCheck(e.target.checked)} />I Agree to the Terms & Conditions. <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setDial(true)}>Learn more</span>
                        {!termCheck && <p style={{ color: 'red' }}>You must accept the terms and conditions to proceed.</p>}
                    </div>
                    <div className="form-card">
                        <label className="input-label">Choose Resume Layout</label>
                        <div className="template-grid">
                            <button type="button" className={`template-card ${selectedTemplate === "modern" ? "active-template" : ""}`}
                                onClick={() => setSelectedTemplate("modern")}>
                                <div className="template-preview modern-template-preview">
                                    <div></div>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <h3>Modern</h3>
                                <p>Orange accent, clean and polished.</p>
                            </button>
                            <button
                                type="button"
                                className={`template-card ${selectedTemplate === "classic" ? "active-template" : ""}`}
                                onClick={() => setSelectedTemplate("classic")}
                            >
                                <div className="template-preview classic-template-preview">
                                    <div></div>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <h3>Classic</h3>
                                <p>Simple, traditional and ATS-friendly.</p>
                            </button>
                            <button
                                type="button"
                                className={`template-card ${selectedTemplate === "compact" ? "active-template" : ""}`}
                                onClick={() => setSelectedTemplate("compact")}
                            >
                                <div className="template-preview compact-template-preview">
                                    <div></div>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <h3>Compact</h3>
                                <p>Best for fitting more content.</p>
                            </button>
                        </div>
                    </div>
                    <button className="generate-btn" onClick={handleGenerateResume} disabled={!termCheck || generate}>
                        Rewrite Resume
                    </button>
                </section>

                <section className="right-section">
                    <div className="preview-header">
                        <div>
                            <p className="eyebrow">Step 2</p>
                            <h2>Preview Resume</h2>
                        </div>
                        {pdfUrl ? (<a className="download-btn" href={pdfUrl} download target="_blank">Download PDF</a>) :
                            (<button className="download-btn" disabled={!previewText}>
                                Download
                            </button>)
                        }

                    </div>

                    <div className="preview-box">
                        {previewText ? (
                            <div className="preview-box pdf-preview-box">
                                {pdfUrl ? (
                                    <iframe
                                        src={pdfUrl}
                                        title="Generated Resume Preview"
                                        className="pdf-preview-frame"
                                    />
                                ) : (
                                    <div className="empty-preview">
                                        <div className="empty-icon">📄</div>
                                        <h3>Your rewritten resume will appear here</h3>
                                        <p>
                                            After you paste a job description, upload your resume, and choose a
                                            layout, your PDF preview will show here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-preview">
                                <div className="empty-icon">📄</div>
                                <h3>Your rewritten resume will appear here</h3>
                                <p>
                                    After you paste a job description and upload your resume,
                                    click “Rewrite Resume” to see the AI-generated preview.
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