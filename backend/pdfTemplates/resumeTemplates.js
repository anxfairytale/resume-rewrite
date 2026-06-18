function checkPage(doc, neededSpace = 80) {
  if (doc.y + neededSpace > doc.page.height - 50) {
    doc.addPage();
  }
}
function sectionTitle(doc, title, color = "#d47706") {
  checkPage(doc, 45);
  doc.moveDown(0.7);
  doc
    .fontSize(12)
    .fillColor(color)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), {
      characterSpacing: 0.8,
    });

  doc
    .moveTo(doc.page.margins.left, doc.y + 4)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 4)
    .strokeColor("#e2e8f0")
    .lineWidth(1)
    .stroke();

  doc.moveDown(0.8);
}

function bullet(doc, text, options = {}) {
  checkPage(doc, 45);
  const startX = options.x || doc.x;
  const width = options.width || 480;
  doc
    .fontSize(options.fontSize || 10)
    .fillColor(options.color || "#334155")
    .font("Helvetica")
    .text("•", startX, doc.y, {
      continued: true,
    });

  doc.text(` ${text}`, {
    width,
    continued: false,
    lineGap: 3,
  });
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function drawExecutiveTemplate(doc, data) {
  const orange = "#d47706";
  const dark = "#111827";
  const gray = "#64748b";

  doc.rect(0, 0, 612, 95).fill("#fff7ed");

  doc
    .fillColor(dark)
    .font("Helvetica-Bold")
    .fontSize(25)
    .text(data.fullName || "Candidate Name", 50, 32);

  doc
    .fillColor(orange)
    .fontSize(12)
    .text(data.title || "Professional Candidate", 50, 62);

  const contact = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.portfolio,
  ]
    .filter(Boolean)
    .join("  |  ");

  if (contact) {
    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(9)
      .text(contact, 50, 80, {
        width: 510,
      });
  }

  doc.y = 120;

  if (data.summary) {
    sectionTitle(doc, "Professional Summary", orange);

    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor("#334155")
      .text(data.summary, {
        width: 500,
        align: "left",
        lineGap: 4,
      });
  }

  if (safeArray(data.skills).length > 0) {
    sectionTitle(doc, "Core Skills", orange);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#334155")
      .text(safeArray(data.skills).join("  •  "), {
        width: 500,
        lineGap: 4,
      });
  }

  if (safeArray(data.experience).length > 0) {
    sectionTitle(doc, "Professional Experience", orange);

    safeArray(data.experience).forEach((exp) => {
      checkPage(doc, 90);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(dark)
        .text(exp.role || "Role", {
          continued: true,
        });

      if (exp.company) {
        doc
          .fillColor(gray)
          .font("Helvetica")
          .text(` | ${exp.company}`, {
            continued: false,
          });
      } else {
        doc.text("");
      }

      if (exp.duration) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(gray)
          .text(exp.duration);
      }

      safeArray(exp.bullets).forEach((b) => bullet(doc, b));

      doc.moveDown(0.7);
    });
  }

  if (safeArray(data.projects).length > 0) {
    sectionTitle(doc, "Projects", orange);

    safeArray(data.projects).forEach((project) => {
      checkPage(doc, 70);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(dark)
        .text(project.name || "Project");

      if (project.description) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#334155")
          .text(project.description, {
            width: 500,
            lineGap: 3,
          });
      }

      doc.moveDown(0.6);
    });
  }

  if (safeArray(data.education).length > 0) {
    sectionTitle(doc, "Education", orange);

    safeArray(data.education).forEach((edu) => {
      checkPage(doc, 45);

      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor(dark)
        .text(edu.degree || "Degree", {
          continued: Boolean(edu.institution),
        });

      if (edu.institution) {
        doc
          .font("Helvetica")
          .fillColor(gray)
          .text(` | ${edu.institution}`);
      }

      if (edu.year) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(gray)
          .text(edu.year);
      }

      doc.moveDown(0.4);
    });
  }

  if (safeArray(data.certifications).length > 0) {
    sectionTitle(doc, "Certifications", orange);

    safeArray(data.certifications).forEach((cert) => {
      bullet(doc, cert);
    });
  }

  if (safeArray(data.achievements).length > 0) {
    sectionTitle(doc, "Achievements", orange);

    safeArray(data.achievements).forEach((achievement) => {
      bullet(doc, achievement);
    });
  }
}

function drawClassicTemplate(doc, data) {
  const dark = "#111827";
  const gray = "#334155";

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(dark)
    .text(data.fullName || "Candidate Name", {
      align: "center",
    });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#64748b")
    .text(data.title || "Professional Candidate", {
      align: "center",
    });

  const contact = [data.email, data.phone, data.location]
    .filter(Boolean)
    .join(" | ");

  if (contact) {
    doc
      .fontSize(9.5)
      .text(contact, {
        align: "center",
      });
  }

  doc.moveDown(1);

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#111827")
    .lineWidth(1)
    .stroke();

  if (data.summary) {
    sectionTitle(doc, "Summary", "#111827");

    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(gray)
      .text(data.summary, {
        width: 500,
        lineGap: 4,
      });
  }

  if (safeArray(data.skills).length > 0) {
    sectionTitle(doc, "Skills", "#111827");

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(gray)
      .text(safeArray(data.skills).join(", "), {
        width: 500,
        lineGap: 4,
      });
  }

  if (safeArray(data.experience).length > 0) {
    sectionTitle(doc, "Experience", "#111827");

    safeArray(data.experience).forEach((exp) => {
      checkPage(doc, 90);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(dark)
        .text(`${exp.role || "Role"}${exp.company ? ` - ${exp.company}` : ""}`);

      if (exp.duration) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#64748b")
          .text(exp.duration);
      }

      safeArray(exp.bullets).forEach((b) => bullet(doc, b));

      doc.moveDown(0.6);
    });
  }

  if (safeArray(data.projects).length > 0) {
    sectionTitle(doc, "Projects", "#111827");

    safeArray(data.projects).forEach((project) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor(dark)
        .text(project.name || "Project");

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(gray)
        .text(project.description || "", {
          width: 500,
          lineGap: 3,
        });

      doc.moveDown(0.5);
    });
  }

  if (safeArray(data.education).length > 0) {
    sectionTitle(doc, "Education", "#111827");

    safeArray(data.education).forEach((edu) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor(dark)
        .text(`${edu.degree || "Degree"}${edu.institution ? ` - ${edu.institution}` : ""}`);

      if (edu.year) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#64748b")
          .text(edu.year);
      }

      doc.moveDown(0.4);
    });
  }
}

function drawSidebarTemplate(doc, data) {
  const orange = "#d47706";
  const dark = "#111827";
  const sidebar = "#fff7ed";

  doc.rect(0, 0, 185, 792).fill(sidebar);
  doc.rect(0, 0, 12, 792).fill(orange);

  doc
    .font("Helvetica-Bold")
    .fontSize(21)
    .fillColor(dark)
    .text(data.fullName || "Candidate Name", 28, 38, {
      width: 130,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(orange)
    .text(data.title || "Professional Candidate", 28, doc.y + 8, {
      width: 130,
    });

  doc.moveDown(1.4);

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(dark)
    .text("CONTACT", 28, doc.y, {
      width: 130,
    });

  doc.moveDown(0.5);

  [data.email, data.phone, data.location, data.linkedin, data.portfolio]
    .filter(Boolean)
    .forEach((item) => {
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#334155")
        .text(item, 28, doc.y, {
          width: 130,
          lineGap: 2,
        });

      doc.moveDown(0.4);
    });

  if (safeArray(data.skills).length > 0) {
    doc.moveDown(1);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(dark)
      .text("SKILLS", 28, doc.y, {
        width: 130,
      });

    doc.moveDown(0.5);

    safeArray(data.skills).forEach((skill) => {
      doc
        .font("Helvetica")
        .fontSize(8.7)
        .fillColor("#334155")
        .text(`• ${skill}`, 28, doc.y, {
          width: 130,
          lineGap: 2,
        });
    });
  }

  doc.x = 215;
  doc.y = 42;

  if (data.summary) {
    sectionTitle(doc, "Professional Summary", orange);

    doc
      .font("Helvetica")
      .fontSize(10.2)
      .fillColor("#334155")
      .text(data.summary, 215, doc.y, {
        width: 330,
        lineGap: 4,
      });
  }

  if (safeArray(data.experience).length > 0) {
    sectionTitle(doc, "Experience", orange);

    safeArray(data.experience).forEach((exp) => {
      checkPage(doc, 90);

      doc
        .font("Helvetica-Bold")
        .fontSize(10.8)
        .fillColor(dark)
        .text(exp.role || "Role", 215, doc.y, {
          width: 330,
        });

      if (exp.company || exp.duration) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#64748b")
          .text(`${exp.company || ""}${exp.duration ? ` | ${exp.duration}` : ""}`, {
            width: 330,
          });
      }

      safeArray(exp.bullets).forEach((b) => {
        bullet(doc, b, {
          x: 215,
          width: 330,
          fontSize: 9.5,
        });
      });

      doc.moveDown(0.6);
    });
  }

  if (safeArray(data.projects).length > 0) {
    sectionTitle(doc, "Projects", orange);

    safeArray(data.projects).forEach((project) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor(dark)
        .text(project.name || "Project", 215, doc.y, {
          width: 330,
        });

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#334155")
        .text(project.description || "", {
          width: 330,
          lineGap: 3,
        });

      doc.moveDown(0.5);
    });
  }

  if (safeArray(data.education).length > 0) {
    sectionTitle(doc, "Education", orange);

    safeArray(data.education).forEach((edu) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10.3)
        .fillColor(dark)
        .text(edu.degree || "Degree", 215, doc.y, {
          width: 330,
        });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#64748b")
        .text(`${edu.institution || ""}${edu.year ? ` | ${edu.year}` : ""}`, {
          width: 330,
        });

      doc.moveDown(0.5);
    });
  }
}

function applyResumeTemplate(doc, template, resumeData) {
  if (template === "classic") {
    drawClassicTemplate(doc, resumeData);
  } else if (template === "sidebar") {
    drawSidebarTemplate(doc, resumeData);
  } else {
    drawExecutiveTemplate(doc, resumeData);
  }
}

module.exports = {
  applyResumeTemplate,
};