import React, { useState } from "react";
import authApi from "../services/api";

function ResumeCustomizationBox({
  currentStyle,
  selectedTemplate,
  onStyleUpdate,
  onContentUpdate,
  onUndo,
  canUndo,
}) {
  const [instruction, setInstruction] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pendingContentChange, setPendingContentChange] = useState(null);

  async function customizeResume() {
    const userMessage = instruction.trim();

    if (!userMessage || isUpdating) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setInstruction("");
    setIsUpdating(true);

    try {
      const response = await authApi.post("/resume/customize-design", {
        instruction: userMessage,
        currentStyle,
        template: selectedTemplate,
      });

      const {
        accepted,
        operationType,
        requiresConfirmation,
        styleConfig,
        contentChanges,
        summary,
      } = response.data;

      if (
        accepted &&
        (operationType === "style" || operationType === "layout") &&
        styleConfig
      ) {
        await onStyleUpdate(styleConfig);
      }

      if (
        accepted &&
        operationType === "content" &&
        requiresConfirmation &&
        Array.isArray(contentChanges) &&
        contentChanges.length > 0
      ) {
        setPendingContentChange({
          summary,
          changes: contentChanges,
        });
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: summary || "Your resume has been updated.",
        },
      ]);
    } catch (err) {
      console.log("Customize resume error:", err);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            err.response?.data?.message ||
            "I could not apply that resume change.",
        },
      ]);
    } finally {
      setIsUpdating(false);
    }
  }

  async function confirmContentChange() {
    if (!pendingContentChange || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      await onContentUpdate(pendingContentChange.changes);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "The requested content change was applied.",
        },
      ]);

      setPendingContentChange(null);
    } catch (err) {
      console.log("Apply content change error:", err);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "The content change could not be applied.",
        },
      ]);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUndo() {
    if (!canUndo || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      await onUndo();

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "The previous design has been restored.",
        },
      ]);
    } catch (err) {
      console.log("Undo style error:", err);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "The previous design could not be restored.",
        },
      ]);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      customizeResume();
    }
  }

  const suggestions = [
    "Make it compact with a pastel mauve accent",
    "Move Core Skills above Professional Summary",
    "Use dotted lines below section headings",
    "Use square bullets and title-case headings",
    "Show skills in two columns",
    "Use an accent-coloured header background",
  ];

  return (
    <div className="resume-customization-box">
      <div className="customization-header">
        <div>
          <p className="eyebrow">Resume assistant</p>
          <h3>Customize your resume</h3>
          <p>
            Change the design, reorder sections, or request a skill update.
          </p>
        </div>

        <button
          type="button"
          className="customization-undo-btn"
          onClick={handleUndo}
          disabled={!canUndo || isUpdating}
        >
          Undo design
        </button>
      </div>

      {messages.length > 0 && (
        <div className="customization-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`customization-message ${message.role}`}
            >
              {message.text}
            </div>
          ))}
        </div>
      )}

      {pendingContentChange && (
        <div className="customization-confirm-card">
          <div>
            <strong>Confirm resume content change</strong>
            <p>{pendingContentChange.summary}</p>
          </div>

          <div className="customization-confirm-actions">
            <button
              type="button"
              className="suggestion-btn suggestion-btn-apply"
              onClick={confirmContentChange}
              disabled={isUpdating}
            >
              Apply change
            </button>

            <button
              type="button"
              className="suggestion-btn suggestion-btn-dismiss"
              onClick={() => setPendingContentChange(null)}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="customization-suggestions">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={isUpdating}
            onClick={() => setInstruction(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="customization-input-area">
        <textarea
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: Put skills above the summary, use dotted mauve dividers, and make the resume more compact"
          rows={3}
          disabled={isUpdating}
        />

        <div className="customization-submit-row">
          <button
            type="button"
            className="customization-apply-btn"
            onClick={customizeResume}
            disabled={isUpdating || !instruction.trim()}
          >
            {isUpdating ? "Updating..." : "Apply"}
          </button>
        </div>
      </div>

      <p className="customization-hint">
        Design and layout changes apply immediately. Skill additions and removals
        require confirmation.
      </p>
    </div>
  );
}

export default ResumeCustomizationBox;
