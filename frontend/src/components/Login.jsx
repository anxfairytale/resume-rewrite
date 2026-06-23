import React, { useState } from "react";
import { BASE_URL } from "../services/api";
import axios from "axios";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import { Country, State, City } from "country-state-city";
function Login({ embedded = false, onAuthSuccess }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("")
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  async function sendOtp() {
    try {
      if (!email) {
        toast.error("Please enter your email first");
        return;
      }

      await axios.post(`${BASE_URL}/auth/send-otp`, { email });

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
      await axios.post(`${BASE_URL}/auth/verify-otp`, { email, otp });
      toast.success("OTP verified");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP entered is wrong");
      console.log(err);
    }
  }
  async function handleAuth(e) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    if (isSignup && !otpVerified) {
      toast.error("Please verify your OTP before signing up");
      return;
    }

    if (isSignup && (!name.trim() || !number.trim() || !dob)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isSignup && (!country || !state || !city)) {
      toast.error("Please select your country, state and city");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const url = isSignup
        ? `${BASE_URL}/auth/signup`
        : `${BASE_URL}/auth/login`;

      const payload = isSignup
        ? {
          name,
          email,
          number,
          password,
          dob,
          country,
          state,
          city,
        }
        : {
          email,
          password,
        };

      const res = await axios.post(url, payload);

      setMessage(res.data.message || "");

      if (isSignup) {
        toast.success(
          res.data.message || "Account created successfully. Please log in."
        );

        setIsSignup(false);
        setPassword("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);

        return;
      }

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );
      window.dispatchEvent(
        new CustomEvent("auth-change", {
          detail: {
            user: res.data.user,
            loggedOut: false,
          },
        })
      );

      toast.success("Logged in successfully");

      if (res.data.user.role === "admin") {
        navigate("/users");
        return;
      }

      if (embedded) {
        onAuthSuccess?.(res.data.user);

        if (res.data.user.role === "admin") {
          navigate("/users");
        }

        return;
      }
      if (res.data.user.role === "admin") {
        navigate("/users");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log(err);

      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={embedded ? "auth-embedded" : "auth-page"}>
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
              {!otpVerified && (
                <p className="otp-resend-text">
                  Didn't receive OTP?{" "}
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={sendOtp}
                  >
                    Click here to resend
                  </button>
                </p>
              )}
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
                <label>Country</label>
                <select value={countryCode} onChange={(e) => {
                  const selectedCountry = Country.getCountryByCode(e.target.value);
                  setCountryCode(e.target.value);
                  setCountry(selectedCountry?.name || "");
                  setStateCode("");
                  setState("");
                  setCity("");
                }}>
                  <option value="">Select country</option>
                  {Country.getAllCountries().map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label>State</label>
                <select value={stateCode} disabled={!countryCode} onChange={(e) => {
                  const selectedState = State.getStateByCodeAndCountry(e.target.value, countryCode);
                  setStateCode(e.target.value);
                  setState(selectedState?.name || "");
                  setCity("");
                }}>
                  <option value="">Select state</option>
                  {State.getStatesOfCountry(countryCode).map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label>City</label>
                <select
                  value={city}
                  disabled={!stateCode}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select city</option>
                  {City.getCitiesOfState(countryCode, stateCode).map((ct) => (
                    <option key={`${ct.name}-${ct.latitude}-${ct.longitude}`} value={ct.name}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {((isSignup && otpVerified) || (!isSignup)) && (<div className="auth-field">
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
          <button
            type="button"
            onClick={() => {
              setIsSignup((previous) => !previous);
              setMessage("");
              setPassword("");
              setOtp("");
              setOtpSent(false);
              setOtpVerified(false);
            }}
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </section>
  );
}

export default Login;