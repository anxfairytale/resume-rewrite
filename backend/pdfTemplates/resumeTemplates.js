function drawClassicTemplate(doc, resumeText) {
  doc
    .fontSize(22)
    .fillColor("#111827")
    .text("Professional Resume", {
      align: "center",
    });

  doc.moveDown(1);

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#111827")
    .stroke();

  doc.moveDown(1);

  doc
    .fontSize(11)
    .fillColor("#334155")
    .text(resumeText, {
      align: "left",
      lineGap: 5,
    });
}

function drawModernTemplate(doc, resumeText) {
  doc
    .rect(0, 0, 612, 90)
    .fill("#f8fafc");

  doc
    .rect(0, 0, 14, 792)
    .fill("#e58e46");

  doc
    .fillColor("#111827")
    .fontSize(24)
    .text("Professional Resume", 50, 35);

  doc
    .moveTo(50, 78)
    .lineTo(560, 78)
    .strokeColor("#e58e46")
    .lineWidth(2)
    .stroke();

  doc
    .fontSize(11)
    .fillColor("#334155")
    .text(resumeText, 50, 115, {
      width: 500,
      align: "left",
      lineGap: 6,
    });
}

function drawCompactTemplate(doc, resumeText) {
  doc
    .fontSize(18)
    .fillColor("#111827")
    .text("Professional Resume", 40, 35);

  doc
    .moveTo(40, 62)
    .lineTo(555, 62)
    .strokeColor("#d47706")
    .lineWidth(1.5)
    .stroke();

  doc
    .fontSize(9.5)
    .fillColor("#334155")
    .text(resumeText, 40, 82, {
      width: 515,
      align: "left",
      lineGap: 3,
    });
}

function applyResumeTemplate(doc, template, resumeText) {
  if (template === "classic") {
    drawClassicTemplate(doc, resumeText);
  } else if (template === "compact") {
    drawCompactTemplate(doc, resumeText);
  } else {
    drawModernTemplate(doc, resumeText);
  }
}

module.exports = {
  applyResumeTemplate,
};