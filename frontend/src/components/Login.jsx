import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";
import { useEffect } from "react";

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob,setDob]=useState(null)
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },[])
  async function handleAuth(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const url = isSignup
        ? "http://localhost:5000/auth/signup"
        : "http://localhost:5000/auth/login";

      const payload = isSignup
        ? { name, email, password, dob }
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
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {isSignup && (
            <div className="auth-field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          )}
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

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