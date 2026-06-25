import React, { useEffect, useState } from "react";
import authApi from "../services/api";
import "../styles/Profile.css";
import { toast } from "react-toastify";
const RESUMES_PER_PAGE = 3;
function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loc, setLoc] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [resumes, setResumes] = useState([]);
  const [dial, setDial] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const totalPages = Math.max(1, Math.ceil(resumes.length / RESUMES_PER_PAGE));
  const startIndex = (currentPage - 1) * RESUMES_PER_PAGE;
  const currentResumes = resumes.slice(startIndex, startIndex + RESUMES_PER_PAGE);
  async function fetchMyResumes() {
    try {
      const res = await authApi.get("/resume/my-resumes", {});
      setResumes(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);
    } catch (err) {
      console.log(err);
      ("Could not load resume history", "error");
    }
  }
  useEffect(() => {
    fetchProfile();
    fetchMyResumes();
  }, []);
  useEffect(() => {
    const lastAvailablePage = Math.max(
      1,
      Math.ceil(
        resumes.length / RESUMES_PER_PAGE
      )
    );
    if (currentPage > lastAvailablePage) {
      setCurrentPage(lastAvailablePage);
    }
  }, [resumes.length, currentPage]);
  function openDeleteDialog(resumeId) {
    setResumeToDelete(resumeId);
    setDial(true);
  }
  async function confirmResumeDelete() {
    if (!resumeToDelete) return;
    try {
      await authApi.delete(`/resume/my-resumes/${resumeToDelete}`);

      setResumes((previousResumes) =>
        previousResumes.filter(
          (resume) => resume.id !== resumeToDelete
        )
      );
      toast.success("Successfully deleted the resume");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Could not delete resume"
      );
    } finally {
      setDial(false);
      setResumeToDelete(null);
    }
  }
  function cancelDelete() {
    setDial(false);
    setResumeToDelete(null);
  }
  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");

      const res = await authApi.get("/auth/profile", {});
      setProfile(res.data);
      setName(res.data.name);
      setLoc(res.data.location);
      setDob(res.data.dob || "");
    } catch (err) {
      console.log(err);
      toast.error("Could not load profile", "error");
    }
  }

  async function updateProfile(e) {
    e.preventDefault();

    try {
      const res = await authApi.put("/auth/profile", {
        name,
        dob,
        loc,
      });

      setProfile((previousProfile) => ({
        ...previousProfile,
        ...res.data.user,
      }));

      setEditMode(false);
      toast.success(res.data.message || "Profile updated successfully");
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.message || "Could not update profile"
      );
    }
  }
  if (!profile) {
    return (
      <section className="profile-page">
        {message && (
          <div className={`profile-toast ${messageType}`}>
            {message}
          </div>
        )}

        <div className="profile-card loading-card">
          <div className="profile-loader"></div>
          <p>Loading profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="profile-header-content">
            <p className="profile-eyebrow">My Account</p>
            <h1>Profile</h1>
            <p>Manage your personal details and resume account information.</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <p className="profile-eyebrow">Basic Details</p>
            <h2>Personal Information</h2>
            <p>View and edit your account details.</p>

            {!editMode ? (
              <>
                <div className="profile-info-list">
                  <div className="profile-info-box">
                    <span>Name</span>
                    <p>{profile.name}</p>
                  </div>

                  <div className="profile-info-box">
                    <span>Email</span>
                    <p>{profile.email}</p>
                  </div>

                  <div className="profile-info-box">
                    <span>Date of Birth</span>
                    <p>{profile.dob}</p>
                  </div>
                  <div className="profile-info-box">
                    <span>Phone No</span>
                    <p>
                      {profile.phone
                        ? `${profile.phone.slice(0, 2)}*****${profile.phone.slice(-3)}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="profile-info-box">
                    <span>Location</span>
                    <p>{profile.location}</p>
                  </div>
                </div>

                <button
                  className="profile-primary-btn"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={updateProfile} className="profile-form">
                <div className="profile-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="profile-field">
                  <label>Location</label>
                  <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} />
                </div>
                <div className="profile-actions">
                  <button className="profile-primary-btn" type="submit">
                    Save Changes
                  </button>

                  <button
                    className="profile-secondary-btn"
                    type="button"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="resume-history-card">
            {dial && (
              <div className="modal-backdrop">
                <dialog open className="payment-dialog">
                  <h2>Delete resume?</h2>

                  <p>
                    Are you sure you want to delete this resume? This action cannot be
                    undone.
                  </p>

                  <div className="payment-actions">
                    <button
                      type="button"
                      onClick={confirmResumeDelete}
                      className="pay-now-btn"
                    >
                      Yes, Delete
                    </button>

                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="later-btn"
                    >
                      No, Cancel
                    </button>
                  </div>
                </dialog>
              </div>
            )}
            <p className="profile-eyebrow">Resume History</p>
            {resumes.length > 0 ? (
              <>
                <div className="resume-history-summary">
                  <span>
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + RESUMES_PER_PAGE,
                      resumes.length
                    )}{" "}
                    of {resumes.length} resumes
                  </span>
                </div>

                <div className="resume-list">
                  {currentResumes.map((resume) => (
                    <div
                      className="resume-item"
                      key={resume.id}
                    >
                      <div className="resume-item-top">
                        <div>
                          <h3>
                            {resume.originalFileName ||
                              "Generated Resume"}
                          </h3>

                          <p>
                            Generated on{" "}
                            {new Date(
                              resume.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <span className="resume-template-pill">
                          {resume.template || "modern"}
                        </span>
                      </div>

                      {resume.jobDescription && (
                        <p className="resume-job-preview">
                          {resume.jobDescription.slice(
                            0,
                            150
                          )}
                          {resume.jobDescription.length >
                            150
                            ? "..."
                            : ""}
                        </p>
                      )}

                      <div className="resume-actions">
                        <a
                          href={resume.generatedPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="profile-primary-btn"
                        >
                          View PDF
                        </a>

                        <a
                          href={resume.generatedPdfUrl}
                          download
                          className="profile-secondary-btn"
                        >
                          Download
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteDialog(resume.id)
                          }
                          className="profile-secondary-btn delete-resume-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="resume-pagination">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((previous) =>
                          Math.max(previous - 1, 1)
                        )
                      }
                    >
                      ← Previous
                    </button>

                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage((previous) =>
                          Math.min(
                            previous + 1,
                            totalPages
                          )
                        )
                      }
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-resume-box">
                <div className="empty-resume-icon">
                  📄
                </div>

                <h3>No resumes yet</h3>

                <p>
                  Once you upload a resume and generate
                  a rewritten version, your history will
                  show here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;