import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <header className="header-section">
      <div className="brand" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
        <div className="brand-icon">2x</div>
        <div>
          <h1>2xResume</h1>
          <p>Rewrite your resume for every job</p>
        </div>
      </div>

      <nav className="right-side">
        <button className="nav-btn" onClick={() => navigate("/home")}>
          Home
        </button>

        <button className="nav-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>

        <button className="nav-btn logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;