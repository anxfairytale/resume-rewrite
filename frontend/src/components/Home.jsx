import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/Home.css";
import FileUpload from "./FileUpload";
import ResumeEditor from "./ResumeEditor";
import Login from "./Login"
import authApi from "../services/api";
import MatchAnalysisModal from "./MatchAnalysisModal";
import { toast } from "react-toastify";
import ResumeCustomizationBox from "./ResumeCustomizationBox";
import parentCompanyLogo from "../assets/footer.png"
const DEFAULT_SECTION_ORDER = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    hiddenSections: [],
  },
};
const TEMPLATE_OPTIONS = [
  {
    id: "executive",
    name: "Executive Orange",
    description: "Elegant, warm, employer-catching.",
    previewClass: "executive-orange-template-preview",
    previewPdf: "/template-previews/executive-orange.pdf"
  },
  {
    id: "executive-navy",
    name: "Executive Navy",
    description: "Formal, polished, and corporate.",
    previewClass: "executive-navy-template-preview",
    previewPdf: "/template-previews/executive-navy.pdf"
  },
  {
    id: "executive-brown",
    name: "Executive Brown",
    description: "Warm, premium, and professional.",
    previewClass: "executive-brown-template-preview",
    previewPdf: "/template-previews/executive-brown.pdf"
  },
  {
    id: "executive-forest",
    name: "Executive Forest",
    description: "Refined, modern, and confident.",
    previewClass: "executive-forest-template-preview",
    previewPdf: "/template-previews/executive-green.pdf"
  },
  {
    id: "classic",
    name: "Classic ATS",
    description: "Clean, simple, traditional.",
    previewClass: "classic-template-preview",
    previewPdf: "/template-previews/classic-ats.pdf"
  },
  {
    id: "sidebar",
    name: "Modern Sidebar",
    description: "Stylish split resume layout.",
    previewClass: "sidebar-template-preview",
    previewPdf: "/template-previews/modern.pdf"
  },
];
function getTemplateStyle(templateName) {
  const template =
    TEMPLATE_STYLE_DEFAULTS[templateName] ||
    TEMPLATE_STYLE_DEFAULTS.executive;

  return {
    ...template,
    sectionOrder: [...template.sectionOrder],
    hiddenSections: [...template.hiddenSections],
  };
}

function Home() {
  const authSectionRef = useRef(null);
  const pdfPanelRef = useRef(null);
  const termsPanelRef = useRef(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [pdfPanelHeight, setPdfPanelHeight] =
    useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [termCheck, setTermCheck] = useState(false);
  const [dial, setDial] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("executive");
  const [styleConfig, setStyleConfig] = useState(
    () => getTemplateStyle("executive")
  );
  const [styleHistory, setStyleHistory] = useState([]);
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
  const [price, setPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false)
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
  async function fetchPaymentPrice() {
  try {
    setLoadingPrice(true);
    const response = await authApi.get("/payment/price");
    const paidAmount = Number(
      response.data?.paidAmount
    );
    if (
      !Number.isFinite(paidAmount) ||
      paidAmount <= 0
    ) {
      throw new Error("Invalid payment price");
    }    
    setPrice(paidAmount);
    return paidAmount;
  } catch (err) {
    console.log(
      "Fetch payment price error:",
      err
    );
    setPrice(null);
    toast.error(
      err.response?.data?.message ||
        "Could not load payment price"
    );
    return null;
  } finally {
    setLoadingPrice(false);
  }
}
  useEffect(() => {
    if (paymentPopUp) {
      fetchPaymentPrice();
    }
  }, [paymentPopUp]);
  useEffect(() => {
    const pdfPanel =
      pdfPanelRef.current;

    if (!pdfPanel) {
      return;
    }

    function updatePanelHeight() {
      const height =
        pdfPanel.getBoundingClientRect()
          .height;

      setPdfPanelHeight(
        Math.ceil(height)
      );
    }

    updatePanelHeight();

    const resizeObserver =
      new ResizeObserver(() => {
        updatePanelHeight();
      });

    resizeObserver.observe(pdfPanel);

    window.addEventListener(
      "resize",
      updatePanelHeight
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        updatePanelHeight
      );
    };
  }, [resumeData, pdfUrl]);
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
  useEffect(() => {
    setTimeout(() => {
      termsPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }, 100)
  }, [dial]);
  function handleTemplateSelect(templateName) {
    setSelectedTemplate(templateName);
    setStyleConfig(getTemplateStyle(templateName));
    setStyleHistory([]);
    setPdfUrl("");
  }
  function handleTemplateClick(templateOption) {
    handleTemplateSelect(templateOption.id);
    setPreviewTemplate(templateOption);
  }
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
      toast.error("Please paste the job description first.");
      return;
    }

    if (!resumeFile) {
      toast.error("Please upload your resume PDF first.");
      return;
    }

    if (!termCheck) {
      toast.error("Please accept the terms and conditions.");
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
      toast.error(err.response?.data?.message || "Something went wrong while analyzing the resume.");
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
      toast.error("Could not load your account details");
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
  async function generatePdfWithStyle(
    nextStyle,
    {
      saveToHistory = true,
      showSuccess = true,
      showError = true,
      resumeOverride = resumeData,
    } = {}
  ) {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthPanel(true);
      throw new Error("Please log in first");
    }

    if (!resumeOverride) {
      throw new Error(
        "Please generate and review the resume first"
      );
    }

    try {
      setGeneratingPdf(true);

      const response = await authApi.post(
        "/resume/generate-pdf",
        {
          resumeData: resumeOverride,
          template: selectedTemplate,
          styleConfig: nextStyle,
          saveToHistory,
          originalFileName: resumeMeta.originalFileName,
          originalFilePath: resumeMeta.originalFilePath,
          jobDescription: resumeMeta.jobDescription,
          skills: resumeMeta.skills,
        }
      );

      setPdfUrl(response.data.pdfUrl);

      if (showSuccess) {
        toast.success("Final PDF generated successfully");
      }

      return response.data;
    } catch (err) {
      console.log("Generate PDF error:", err);

      if (showError) {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Something went wrong while generating the PDF"
        );
      }

      throw err;
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleGenerateFinalPdf() {
    try {
      await generatePdfWithStyle(styleConfig, {
        saveToHistory: true, showSuccess: true, showError: true
      });
    } catch (err) {
      console.log(err);
    }
  }
  async function handleStyleUpdate(nextStyle) {
    const previousStyle = styleConfig;
    await generatePdfWithStyle(nextStyle, {
      saveToHistory: false,
      showSuccess: false,
      showError: false,
    });
    setStyleHistory((previous) => [
      ...previous,
      previousStyle,
    ]);

    setStyleConfig(nextStyle);
  }
  async function handleUndoStyle() {
    if (styleHistory.length === 0) {
      return;
    }

    const previousStyle =
      styleHistory[styleHistory.length - 1];

    await generatePdfWithStyle(previousStyle, {
      saveToHistory: false,
      showSuccess: false,
      showError: false,
    });

    setStyleConfig(previousStyle);

    setStyleHistory((previous) =>
      previous.slice(0, -1)
    );
  }
  async function handleContentUpdate(contentChanges) {
    if (!Array.isArray(contentChanges) || contentChanges.length === 0) {
      return;
    }

    let updatedResume = {
      ...resumeData,
      skills: Array.isArray(resumeData?.skills)
        ? [...resumeData.skills]
        : [],
    };

    contentChanges.forEach((change) => {
      const value = String(change.value || "").trim();

      if (!value) {
        return;
      }

      if (change.action === "add_skill") {
        const alreadyExists = updatedResume.skills.some(
          (skill) =>
            String(skill).trim().toLowerCase() === value.toLowerCase()
        );

        if (!alreadyExists) {
          updatedResume.skills.push(value);
        }
      }

      if (change.action === "remove_skill") {
        updatedResume.skills = updatedResume.skills.filter(
          (skill) =>
            String(skill).trim().toLowerCase() !== value.toLowerCase()
        );
      }
    });

    await generatePdfWithStyle(styleConfig, {
      saveToHistory: false,
      showSuccess: false,
      showError: true,
      resumeOverride: updatedResume,
    });

    setResumeData(updatedResume);
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
      const orderPriceInRupees =
        Number(order.amount) / 100;

      setPrice(orderPriceInRupees);
      const options = {
        key: "rzp_test_T3OP1amnICZid0",
        amount: order.amount,
        currency: order.currency,
        name: "ResumeBot",
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
            toast.success(verifyResponse.data.message);
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
            toast.error(err.response?.data?.message || "Payment verification failed");
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
      toast.error(err.response?.data?.message || "Payment failed");
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
      {analyzing && (
        <div className="generation-overlay">
          <div className="resume-loader">
            <div className="loader-ring"></div>
            <div>
              <h3>Creating your resume</h3>
              <p>Tailoring your content and preparing the document...</p>
            </div>
          </div>
        </div>
      )}
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
                <span className="price">
                  {loadingPrice
                    ? "Loading..."
                    : price !== null
                      ? `₹${price}`
                      : "Unavailable"}
                </span>

                <span className="price-note">Pro resume credits</span>
              </div>

              <div className="payment-actions">
                <button
                  type="button"
                  className="pay-now-btn"
                  onClick={handlePayment}
                  disabled={
                    loadingPrice ||
                    price === null
                  }
                >
                  {loadingPrice
                    ? "Loading price..."
                    : "Pay Now"}
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
                  <dialog className="terms-dialog" open >
                    <div className="terms-header">
                      <h1>Terms and Conditions</h1>
                    </div>

                    <div className="terms-content">
                      <p>
                        TERMS AND CONDITIONS
                        {"\n\n"}
                        Last Updated: 12 June 2026
                        {"\n\n"}
                        Welcome to ResumeBot. By using this website, uploading your resume,
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
                  {TEMPLATE_OPTIONS.map((templateOption) => (
                    <button
                      key={templateOption.id}
                      type="button"
                      className={`template-card ${selectedTemplate === templateOption.id
                        ? "active-template"
                        : ""
                        }`}
                      onClick={() =>
                        handleTemplateClick(templateOption)
                      }
                    >
                      <div
                        className={`template-preview ${templateOption.previewClass}`}
                      >
                        <div></div>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>

                      <h3>{templateOption.name}</h3>
                      <p>{templateOption.description}</p>
                      <span className="template-card-preview-label">
                        Click to preview
                      </span>
                    </button>
                  ))}
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
                      <h2>Continue with ResumeBot</h2>
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

              <section className="pdf-panel" ref={pdfPanelRef}>
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
                {pdfUrl && (
                  <ResumeCustomizationBox
                    currentStyle={styleConfig}
                    selectedTemplate={selectedTemplate}
                    onStyleUpdate={handleStyleUpdate}
                    onContentUpdate={handleContentUpdate}
                    onUndo={handleUndoStyle}
                    canUndo={styleHistory.length > 0}
                  />
                )}
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
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-company">
            <img src={parentCompanyLogo} className="footer-logo" />
            <div>
              <p className="footer-powered-by">A product by</p>
              <h3>2xSmart Solutions Pvt Ltd</h3>
              <p className="footer-description">
                Building thoughtful digital solutions for modern businesses.
              </p>
            </div>
          </div>
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <a href="mailto: poornima@2xsmart.com">
              <span className="footer-contact-icon">✉</span>
              poornima@2xsmart.com
            </a>
            <a href="tel:+919384898964">
              <span className="footer-contact-icon">☎</span>
              +91 9384898964
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p> © {new Date().getFullYear()} 2xSmart Solutions Pvt Ltd. All rights
            reserved.</p>
        </div>
      </footer>
      {previewTemplate && (
        <div
          className="template-preview-backdrop"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="template-preview-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="template-preview-dialog-header">
              <div>
                <p className="eyebrow">Template preview</p>
                <h2>{previewTemplate.name}</h2>
                <p>{previewTemplate.description}</p>
              </div>

              <button
                type="button"
                className="template-preview-close"
                onClick={() => setPreviewTemplate(null)}
                aria-label="Close template preview"
              >
                ×
              </button>
            </div>

            <div className="template-pdf-container">
              <iframe
                src={`${previewTemplate.previewPdf}#toolbar=0&navpanes=0`}
                title={`${previewTemplate.name} preview`}
                className="template-pdf-frame"
              />
            </div>

            <div className="template-preview-dialog-actions">
              <span className="template-selected-message">
                ✓ {previewTemplate.name} selected
              </span>

              <button
                type="button"
                className="template-preview-done-btn"
                onClick={() => setPreviewTemplate(null)}
              >
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;