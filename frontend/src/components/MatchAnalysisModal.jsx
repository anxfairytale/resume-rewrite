import React from "react";
import '../styles/MatchAnalysisModal.css'
function MatchAnalysisModal({ matchAnalysis, onClose }) {
  const score = Number(matchAnalysis.matchPercentage) || 0;

  function getScoreLabel() {
    if (score >= 85) return "Very strong match";
    if (score >= 70) return "Good match";
    if (score >= 50) return "Partial match";
    return "Needs improvement";
  }

  return (
    <div className="match-modal-backdrop">
      <dialog className="match-modal" open>
        <div className="match-modal-header">
          <div>
            <p className="eyebrow">AI Job Fit Estimate</p>
            <h2>Resume Match Prediction</h2>
          </div>

          <button type="button" className="match-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="match-main-score">
          <div className="match-score-circle">{score}%</div>

          <div>
            <h3>{getScoreLabel()}</h3>
            <p>{matchAnalysis.summary}</p>
          </div>
        </div>

        <div className="match-modal-grid">
          <div className="match-info-card">
            <h4>Strong Matches</h4>

            {(matchAnalysis.strongMatches || []).length > 0 ? (
              matchAnalysis.strongMatches.map((item, index) => (
                <p key={index}>✅ {item}</p>
              ))
            ) : (
              <p>No strong matches found yet.</p>
            )}
          </div>

          <div className="match-info-card">
            <h4>Missing Skills</h4>

            {(matchAnalysis.missingSkills || []).length > 0 ? (
              matchAnalysis.missingSkills.map((item, index) => (
                <p key={index}>⚠️ {item}</p>
              ))
            ) : (
              <p>No major missing skills detected.</p>
            )}
          </div>

          <div className="match-info-card">
            <h4>Important Keywords</h4>

            <div className="keyword-list">
              {(matchAnalysis.importantKeywords || []).length > 0 ? (
                matchAnalysis.importantKeywords.map((item, index) => (
                  <span key={index}>{item}</span>
                ))
              ) : (
                <p>No keywords detected.</p>
              )}
            </div>
          </div>

          <div className="match-info-card">
            <h4>Resume Improvements</h4>

            {(matchAnalysis.resumeImprovements || []).length > 0 ? (
              matchAnalysis.resumeImprovements.map((item, index) => (
                <p key={index}>🛠️ {item}</p>
              ))
            ) : (
              <p>No improvement suggestions available.</p>
            )}
          </div>

          <div className="match-info-card">
            <h4>Relocation Check</h4>

            <p>
              {matchAnalysis.relocation?.needed ? "📍 " : "✅ "}
              {matchAnalysis.relocation?.message ||
                "No relocation concern found."}
            </p>
          </div>

          <div className="match-info-card">
            <h4>Upskill Suggestions</h4>

            {(matchAnalysis.upskillingSuggestions || []).length > 0 ? (
              matchAnalysis.upskillingSuggestions.map((item, index) => (
                <p key={index}>
                  <strong>{item.skill}</strong>: {item.reason}
                </p>
              ))
            ) : (
              <p>No upskilling suggestions available.</p>
            )}
          </div>
        </div>

        <div className="match-modal-footer">
          <p>
            This is an AI estimate based on your resume and the job description,
            not a hiring guarantee.
          </p>

          <button
            type="button"
            className="action-btn action-btn-primary"
            onClick={onClose}
          >
            Continue Editing
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default MatchAnalysisModal;