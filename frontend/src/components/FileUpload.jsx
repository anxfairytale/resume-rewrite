import React, { useRef, useState } from "react";
function FileUpload({ resumeFile, setResumeFile }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  function handleBrowseClick() {
    inputRef.current.click();
  }
  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      addFile(selectedFile);
    }
  }
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      addFile(droppedFile);
    }
  }

  function addFile(file) {
    const allowedType = "application/pdf";
    const maxSize = 5 * 1024 * 1024; 

    if (file.type !== allowedType) {
      alert("Only PDF resumes are allowed.");
      return;
    }

    if (file.size > maxSize) {
      alert("File size should be below 5MB.");
      return;
    }

    setResumeFile(file);
  }

  function removeFile() {
    setResumeFile(null);
    inputRef.current.value = "";
  }

  function formatSize(size) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="upload-card">
      <div className="upload-header">
        <div className="upload-icon">☁️</div>

        <div>
          <h2>Upload resume</h2>
          <p>Select or drag and drop your resume PDF</p>
        </div>
      </div>

      <div
        className={`drop-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf"
          onChange={handleFileChange}
        />

        <div className="drop-icon">☁️</div>

        <h3>Choose a file or drag & drop it here</h3>
        <p>PDF only, up to 5MB</p>

        <button type="button" className="browse-btn" onClick={handleBrowseClick}>
          Browse File
        </button>
      </div>

      {resumeFile && (
        <div className="file-card">
          <div className="file-type">PDF</div>

          <div className="file-details">
            <h4>{resumeFile.name}</h4>
            <p>{formatSize(resumeFile.size)}</p>
          </div>

          <button className="remove-btn" onClick={removeFile}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;