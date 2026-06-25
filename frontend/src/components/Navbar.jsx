import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Home.css";
import brandIcon from "../assets/logo.png"
function readStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.log("Could not parse user:", err);
    return null;
  }
}
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  function isActive(path) {
    return location.pathname === path;
  }
  const [user, setUser] = useState(readStoredUser);
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token && user);
  const role = user?.role;
  useEffect(() => {
    function handleAuthChange(event) {
      if (event.detail?.user !== undefined) {
        setUser(event.detail.user);
      } else {
        setUser(readStoredUser());
      }
    }

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  function handleLogin() {
    navigate("/?auth=login");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    window.dispatchEvent(
      new CustomEvent("auth-change", {
        detail: {
          user: null,
          loggedOut: true,
        },
      })
    );

    navigate("/", { replace: true });
  }

  return (
    <header className="header-section">
      <div
        className="brand"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <div className="brand-icon"><img className="brand-logo" src={brandIcon} /></div>

        <div>
          <h1>ResumeBot</h1>
          <p>Rewrite your resume for every job</p>
        </div>
      </div>

      <nav className="right-side">
        {!isLoggedIn ? (
          <button
            type="button"
            className="nav-btn login-btn"
            onClick={handleLogin}
          >
            Login
          </button>
        ) : (
          <>
            <p className="user-greet">
              Hello {user?.name}
            </p>

            {role === "user" && (
              <>
                <button
                  type="button"
                  className={`nav-btn ${isActive("/") ? "active-nav-btn" : ""}`}
                  onClick={() => navigate("/")}
                >
                  Home
                </button>

                <button
                  type="button"
                  className={`nav-btn ${isActive("/profile")
                    ? "active-nav-btn"
                    : ""
                    }`}
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </button>
              </>
            )}

            {role === "admin" && (
              <>
                <button
                  type="button"
                  className={`nav-btn ${isActive("/users")
                    ? "active-nav-btn"
                    : ""
                    }`}
                  onClick={() => navigate("/users")}
                >
                  Users
                </button>

                <button
                  type="button"
                  className={`nav-btn ${isActive("/free-users")
                    ? "active-nav-btn"
                    : ""
                    }`}
                  onClick={() => navigate("/free-users")}
                >
                  Free Users
                </button>

                <button
                  type="button"
                  className={`nav-btn ${isActive("/paid-users")
                      ? "active-nav-btn"
                      : ""
                    }`}
                  onClick={() => navigate("/paid-users")}
                >
                  Paid Users
                </button>

                <button
                  type="button"
                  className={`nav-btn ${isActive("/settings")
                      ? "active-nav-btn"
                      : ""
                    }`}
                  onClick={() => navigate("/settings")}
                >
                  Settings
                </button>
              </>
            )}

            <button
              type="button"
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;