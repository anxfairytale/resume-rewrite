import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/Home.css";
import FileUpload from "./FileUpload";
import ResumeEditor from "./ResumeEditor";
import Login from "./Login"
import authApi from "../services/api";
import MatchAnalysisModal from "./MatchAnalysisModal";
import { toast } from "react-toastify";
function Home() {
  const authSectionRef = useRef(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [termCheck, setTermCheck] = useState(false);
  const [dial, setDial] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("executive");
  const [paymentPopUp, setPaymentPopUp] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [user, setUser] = useState(null);
  const [resumeMeta, setResumeMeta] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [pendingRewrite, setPendingRewrite] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const isLoggedIn = Boolean(
    localStorage.getItem("token") && user
  );
  const normalizedPlan = String(user?.plan || "free").trim().toLowerCase();
  const isProUser = normalizedPlan === "pro";
  const freeUsesLeft = Number(user?.freeUsesLeft ?? 0);
  const proUsesLeft = Number(user?.proUsesLeft ?? 0);

  const availableUses = isProUser
    ? proUsesLeft
    : freeUsesLeft;
  async function getUser() {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);
        return null;
      }

      const parsedUser = JSON.parse(storedUser);

      const res = await authApi.get(
        `/auth/user/${parsedUser.id}`
      );
      console.log("USER FROM BACKEND:", res.data);
      console.log("PLAN:", res.data.plan);
      console.log("FREE USES:", res.data.freeUsesLeft);
      console.log("PRO USES:", res.data.proUsesLeft);
      setUser(res.data);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      return res.data;
    } catch (err) {
      console.log(err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);

      return null;
    } finally {
      setLoadingUser(false);
    }
  }
  useEffect(() => {
    getUser();
  }, []);
  useEffect(() => {
    if (searchParams.get("auth") === "login") {
      setShowAuthPanel(true);

      setTimeout(() => {
        authSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [searchParams]);
  function openAuthPanel() {
    setShowAuthPanel(true);
    toast.info("Please log in or sign up to continue");
    setTimeout(() => {
      authSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }
  async function handleAnalyzeResume() {
    setPaymentPopUp(false);
    const token = localStorage.getItem("token");
    if (!token) {
      setPendingRewrite(true);
      setShowAuthPanel(true);
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
      const response = await authApi.post(
        "/resume/analyze",
        formData,
      );

      setResumeData(response.data.resumeData);
      setMatchAnalysis(response.data.matchAnalysis)
      setShowMatchModal(true);
      setResumeMeta({
        originalFileName: response.data.originalFileName,
        originalFilePath: response.data.originalFilePath,
        jobDescription: response.data.jobDescription,
        skills: response.data.skills,
      });
      await getUser();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Something went wrong while analyzing the resume.");
    } finally {
      setAnalyzing(false);
    }
  }
  async function handleAuthSuccess(authenticatedUser) {
    if (!authenticatedUser) {
      return;
    }
    const completeUser = await getUser();
    if (!completeUser) {
      alert("Could not load your account details");
      return;
    }
    setUser(completeUser);

    localStorage.setItem(
      "user",
      JSON.stringify(completeUser)
    );

    window.dispatchEvent(
      new CustomEvent("auth-change", {
        detail: {
          user: completeUser,
          loggedOut: false,
        },
      })
    );

    setShowAuthPanel(false);
    setSearchParams({});

    if (pendingRewrite) {
      setPendingRewrite(false);
      continueRewriteFlow(completeUser);
    }
  }
  function continueRewriteFlow(currentUser) {
    if (!currentUser) {
      setPendingRewrite(true);
      setShowAuthPanel(true);
      return;
    }

    const plan = String(currentUser.plan || "free")
      .trim()
      .toLowerCase();
    const proUses = Number(currentUser.proUsesLeft ?? 0);

    const freeCredits = Number(currentUser.freeUsesLeft ?? 0);
    const proCredits = Number(currentUser.proUsesLeft ?? 0);

    console.log("USER CREDIT CHECK:", {
      id: currentUser.id,
      plan,
      freeCredits,
      proCredits,
    });

    if (plan === "pro" && proUses > 0) {
      handleAnalyzeResume();
      return;
    }
    setPaymentPopUp(true);
  }
  async function handleGenerateFinalPdf() {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthPanel(true);
      return;
    }

    if (!resumeData) {
      alert("Please generate and review resume sections first.");
      return;
    }

    try {
      setGeneratingPdf(true);

      const response = await authApi.post(
        "/resume/generate-pdf",
        {
          resumeData,
          template: selectedTemplate,
          originalFileName: resumeMeta.originalFileName,
          originalFilePath: resumeMeta.originalFilePath,
          jobDescription: resumeMeta.jobDescription,
          skills: resumeMeta.skills,
        },
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
  async function handlePayment() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowAuthPanel(true);
        return;
      }
      const orderResponse = await authApi.post("/payment/create-order", {},);
      const order = orderResponse.data;
      const options = {
        key: "rzp_test_T3OP1amnICZid0",
        amount: order.amount,
        currency: order.currency,
        name: "2xResume",
        description: "Upgrade to Pro Plan",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await authApi.post("/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },);
            alert(verifyResponse.data.message);
            if (verifyResponse.data.user) {
              localStorage.setItem("user", JSON.stringify(verifyResponse.data.user));
              setUser(verifyResponse.data.user);
            } else {
              await getUser();
            }
            setPaymentPopUp(false);
            getUser();
          } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#d47706"
        }
      };
      const razorpayPopup = new window.Razorpay(options);
      razorpayPopup.open();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Payment failed");
    }
  }
  async function handleRewriteClick() {
    const token = localStorage.getItem("token");

    if (!token) {
      setPendingRewrite(true);
      openAuthPanel();
      return;
    }

    const currentUser = await getUser();

    if (!currentUser) {
      setPendingRewrite(true);
      openAuthPanel();
      return;
    }

    continueRewriteFlow(currentUser);
  }
  useEffect(() => {
    function handleAuthChange(event) {
      const updatedUser = event.detail?.user;

      if (updatedUser) {
        setUser(updatedUser);
        return;
      }

      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);
        setResumeData(null);
        setMatchAnalysis(null);
        setShowMatchModal(false);
        setPdfUrl("");
        setPaymentPopUp(false);
        setPendingRewrite(false);
        setShowAuthPanel(false);

        setResumeMeta({
          originalFileName: "",
          originalFilePath: "",
          jobDescription: "",
          skills: "",
        });
      }
    }

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);
  return (
    <div className="home-page">
      <main className="main-page">
        {paymentPopUp && (
          <div className="modal-backdrop">
            <dialog open className="payment-dialog">
              <button
                className="payment-close"
                onClick={() => setPaymentPopUp(false)}
              >
                ×
              </button>
              <div className="payment-badge">PRO</div>
              <h1>Upgrade to Pro</h1>
              <p className="payment-subtitle">
                Generate more tailored resumes and continue after your free uses end.
              </p>
              {user && (
                <div className="uses-card">
                  <p>
                    {isProUser
                      ? `You have ${proUsesLeft} pro uses left`
                      : `You have ${freeUsesLeft} free uses left`}
                  </p>
                </div>
              )}
              <div className="price-box">
                <span className="price">₹99</span>
                <span className="price-note">Pro resume credits</span>
              </div>

              <div className="payment-actions">
                <button className="pay-now-btn" onClick={handlePayment}>
                  Pay Now
                </button>

                <button
                  type="button"
                  className="later-btn"
                  disabled={
                    isProUser
                      ? proUsesLeft <= 0
                      : freeUsesLeft <= 0
                  }
                  onClick={handleAnalyzeResume}
                >
                  Later
                </button>
              </div>
              {isProUser && proUsesLeft <= 0 && (
                <p className="payment-warning">
                  You have no Pro uses left. Please purchase more credits to continue.
                </p>
              )}

              {!isProUser && freeUsesLeft <= 0 && (
                <p className="payment-warning">
                  You have no free uses left. Please upgrade to continue.
                </p>
              )}

            </dialog>
          </div>
        )}
        {!resumeData || !isLoggedIn ? (
          <section className="upload-layout">
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
                    className={`template-card ${selectedTemplate === "executive" ? "active-template" : ""
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
                    className={`template-card ${selectedTemplate === "classic" ? "active-template" : ""
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
                    className={`template-card ${selectedTemplate === "sidebar" ? "active-template" : ""
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

              <div className="form-card terms-box">
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
              {user && (
                <div className="form-card">
                  <p>
                    {isProUser
                      ? `You have ${proUsesLeft} pro uses left`
                      : `You have ${freeUsesLeft} free uses left`}
                  </p>
                </div>
              )}
              <button
                className="generate-btn"
                onClick={handleRewriteClick}
                disabled={!termCheck || analyzing}
              >
                {analyzing ? "Creating Editable Sections..." : "Rewrite Resume"}
              </button>
            </section>
            <section className="right-section" ref={authSectionRef}>
              {showAuthPanel ? (
                <div className="inline-auth-panel">
                  <div className="inline-auth-header">
                    <div>
                      <p className="eyebrow">Account</p>
                      <h2>Continue with 2xResume</h2>
                      <p>
                        Log in or create an account to rewrite and save your
                        resume.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-auth-close"
                      onClick={() => {
                        setShowAuthPanel(false);
                        setPendingRewrite(false);
                        setSearchParams({});
                      }}
                      aria-label="Close authentication panel"
                    >
                      ×
                    </button>
                  </div>

                  <Login
                    embedded
                    onAuthSuccess={handleAuthSuccess}
                  />
                </div>
              ) : (
                <>
                  <div className="preview-header">
                    <div>
                      <p className="eyebrow">Step 2</p>
                      <h2>Review Resume</h2>
                    </div>

                    <button className="download-btn" disabled>
                      Download
                    </button>
                  </div>

                  <div className="preview-box">
                    <div className="empty-preview">
                      <div className="empty-icon">📄</div>

                      <h3>
                        Your editable resume sections will appear here
                      </h3>

                      <p>
                        After you paste a job description and upload your
                        resume, click “Rewrite Resume” to review and edit the
                        generated sections.
                      </p>

                      {!user && !loadingUser && (
                        <button
                          type="button"
                          className="preview-login-btn"
                          onClick={() => setShowAuthPanel(true)}
                        >
                          Login or Sign Up
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </section>
        ) : (
          <section className="editing-workspace">
            <div className="workspace-header">
              <div>
                <p className="eyebrow">Step 2</p>
                <h2>Edit and preview your resume</h2>
                <p> Review the AI-generated sections, make changes, then download your final resume.</p>
              </div>
              <div className="workspace-actions">
                <button className="action-btn action-btn-secondary" onClick={() => setResumeData(null)}>
                  Back to Upload
                </button>
                {resumeData && (
                  <button
                    className="action-btn action-btn-primary"
                    onClick={handleGenerateFinalPdf}
                    disabled={generatingPdf}
                  >
                    {generatingPdf ? "Generating Final PDF..." : "Generate Final PDF"}
                  </button>
                )}
                {pdfUrl ? (
                  <a
                    className="action-btn action-btn-download"
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  <button className="action-btn action-btn-disabled" disabled>
                    Download PDF
                  </button>
                )}
              </div>
            </div>
            {matchAnalysis && (
              <button
                type="button"
                className="match-summary-card"
                onClick={() => setShowMatchModal(true)}
              >
                <div className="match-percent">
                  {matchAnalysis.matchPercentage}%
                </div>

                <div>
                  <h3>Resume Match Estimate</h3>
                  <p>{matchAnalysis.summary}</p>
                </div>

                <span className="match-open-text">View details</span>
              </button>
            )}
            <div className="editor-preview-layout">
              <section className="editor-panel">
                <ResumeEditor
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                />
              </section>

              <section className="pdf-panel">
                <div className="pdf-preview-box">
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      title="Generated Resume Preview"
                      className="pdf-preview-frame"
                    />
                  ) : (
                    <div className="empty-preview">
                      <h3>PDF preview will appear here</h3>
                      <p>Save or regenerate the resume to preview the final PDF.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
            {showMatchModal && matchAnalysis && (
              <MatchAnalysisModal
                matchAnalysis={matchAnalysis}
                onClose={() => setShowMatchModal(false)}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Home;