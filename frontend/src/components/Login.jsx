import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";
import { useEffect } from "react";
import { toast } from "react-toastify"
function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [number, setNumber] = useState("");
  const [location, setLocation] = useState("")
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("")
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  async function sendOtp() {
    try {
      if (!email) {
        toast.error("Please enter your email first");
        return;
      }

      await axios.post("http://localhost:5000/auth/send-otp", { email });

      toast.success("OTP sent");
      setOtpSent(true);
    } catch (err) {
      toast.error("Failed to send OTP");
      console.log(err);
    }
  }
  async function verifyOtp() {
    try {
      if (!otp) {
        toast.error("Please enter OTP");
        return;
      }
      await axios.post("http://localhost:5000/auth/verify-otp", { email, otp });
      toast.success("OTP verified");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP entered is wrong");
      console.log(err);
    }
  }
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [])
  async function handleAuth(e) {
    e.preventDefault();
    if (isSignup && !otpVerified) {
      toast.error("Please verify your OTP before signing up");
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      const url = isSignup
        ? "http://localhost:5000/auth/signup"
        : "http://localhost:5000/auth/login";

      const payload = isSignup
        ? { name, email, number, password, dob, location }
        : { email, password };

      const res = await axios.post(url, payload);

      setMessage(res.data.message);

      if (!isSignup) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "/home";
      } else {
        setIsSignup(false);
        setPassword("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);
      }
    } catch (err) {
      console.log(err);

      setMessage(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">R</div>
          <div>
            <h1>Resume AI</h1>
            <p>Rewrite resumes with AI assistance</p>
          </div>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">{isSignup ? "Create Account" : "Welcome Back"}</p>
          <h2>{isSignup ? "Sign up" : "Login"}</h2>
          <p>
            {isSignup
              ? "Create an account to start rewriting resumes safely."
              : "Login to generate and download your rewritten resume."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {isSignup && (
            <div className="auth-field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>

            <div className="input-btn-row">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {isSignup && (
                <button
                  type="button"
                  className="small-auth-btn"
                  onClick={sendOtp}
                  disabled={otpSent}
                >
                  {otpSent ? "Sent" : "Send OTP"}
                </button>
              )}
            </div>
          </div>

          {isSignup && otpSent && (
            <div className="auth-field">
              <label>OTP</label>

              <div className="input-btn-row">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  className="small-auth-btn"
                  onClick={verifyOtp}
                  disabled={otpVerified}
                >
                  {otpVerified ? "Verified" : "Verify"}
                </button>
              </div>
              <p>Didn't receive OTP? <span onClick={sendOtp} style={{color:"red"}}>Click here to resend</span></p>
            </div>
          )}

          {isSignup && otpVerified && (
            <>
              <div className="auth-field">
                <label>Phone No</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>Location</label>
                <input type="text" value={location} placeholder="Enter your city" onChange={(e) => setLocation(e.target.value)} />
              </div>
            </>
          )}
          {((isSignup && otpVerified )||(!isSignup))&&(<div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          )}
          {message && <p className="auth-message">{message}</p>}

          <button className="auth-btn" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="switch-auth">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </section>
  );
}

export default Login;