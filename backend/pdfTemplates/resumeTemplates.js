function checkPage(doc, neededSpace = 100) {
  if (
    doc.y + neededSpace >
    doc.page.height - doc.page.margins.bottom
  ) {
    doc.addPage();
    return true;
  }

  return false;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}
const DEFAULT_SECTION_ORDER = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
];
function getFonts(fontFamily) {
  if (fontFamily === "Times-Roman") {
    return {
      regular: "Times-Roman",
      bold: "Times-Bold",
    };
  }

  if (fontFamily === "Courier") {
    return {
      regular: "Courier",
      bold: "Courier-Bold",
    };
  }

  return {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
  };
}

function lightenHex(hex, amount = 0.9) {
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex || "")
    ? hex
    : "#d47706";

  const number = parseInt(safeHex.slice(1), 16);

  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  const mix = (channel) =>
    Math.round(
      channel + (255 - channel) * amount
    );

  return `#${[
    mix(red),
    mix(green),
    mix(blue),
  ]
    .map((value) =>
      value.toString(16).padStart(2, "0")
    )
    .join("")}`;
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatHeading(title, headingStyle) {
  if (headingStyle === "title-case") {
    return titleCase(title);
  }

  return String(title || "").toUpperCase();
}

function getContactSeparator(type) {
  if (type === "dot") {
    return "  ·  ";
  }

  if (type === "bullet") {
    return "  •  ";
  }

  return "  |  ";
}

function getBulletSymbol(type) {
  if (type === "dash") {
    return "-";
  }

  if (type === "square") {
    return "▪";
  }

  if (type === "arrow") {
    return ">";
  }

  return "•";
}

function isSectionVisible(style, sectionName) {
  return !safeArray(
    style.hiddenSections
  ).includes(sectionName);
}

function drawSectionDivider(
  doc,
  x,
  y,
  width,
  style
) {
  const dividerStyle =
    style.dividerStyle || "solid";

  if (
    !style.showSectionLines ||
    dividerStyle === "none"
  ) {
    return 0;
  }

  const color = lightenHex(
    style.accentColor,
    0.55
  );

  const thickness =
    style.dividerThickness || 1;

  doc
    .strokeColor(color)
    .lineWidth(thickness)
    .undash();

  if (dividerStyle === "dotted") {
    doc.dash(1, {
      space: 3,
    });
  }

  if (dividerStyle === "dashed") {
    doc.dash(5, {
      space: 3,
    });
  }

  if (dividerStyle === "short") {
    doc
      .moveTo(x, y)
      .lineTo(x + width * 0.3, y)
      .stroke();

    doc.undash();

    return 4;
  }

  if (dividerStyle === "double") {
    doc
      .moveTo(x, y)
      .lineTo(x + width, y)
      .stroke();

    doc
      .moveTo(x, y + 3)
      .lineTo(x + width, y + 3)
      .stroke();

    doc.undash();

    return 7;
  }

  doc
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke();

  doc.undash();

  return 4;
}

function sectionTitle(
  doc,
  title,
  style,
  options = {}
) {
  const x =
    options.x ??
    doc.page.margins.left;

  const width =
    options.width ??
    doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right;
  const keepWithNext =
    Number(options.keepWithNext) || 45;

  const headingHeight =
    style.headingFontSize + 18;

  const spacingHeight =
    style.sectionSpacing * 12;
    checkPage(
    doc,
    headingHeight +
      spacingHeight +
      keepWithNext
  );
  const fonts = getFonts(
    style.fontFamily
  );

  const label = formatHeading(
    title,
    style.headingStyle
  );

  doc.moveDown(style.sectionSpacing);

  const startY = doc.y;

  if (
    style.headingStyle === "accent-block"
  ) {
    doc
      .roundedRect(
        x,
        startY,
        width,
        headingHeight,
        3
      )
      .fill(
        lightenHex(
          style.accentColor,
          0.82
        )
      );

    doc
      .font(fonts.bold)
      .fontSize(style.headingFontSize)
      .fillColor(style.accentColor)
      .text(
        label,
        x + 8,
        startY + 4,
        {
          width: width - 16,
          characterSpacing: 0.4,
        }
      );

    doc.y =
      startY + headingHeight + 2;
  } else if (
    style.headingStyle === "left-border"
  ) {
    doc
      .rect(
        x,
        startY,
        3,
        style.headingFontSize + 5
      )
      .fill(style.accentColor);

    doc
      .font(fonts.bold)
      .fontSize(style.headingFontSize)
      .fillColor(style.accentColor)
      .text(
        label,
        x + 9,
        startY,
        {
          width: width - 9,
          characterSpacing: 0.4,
        }
      );
  } else {
    doc
      .font(fonts.bold)
      .fontSize(style.headingFontSize)
      .fillColor(style.accentColor)
      .text(label, x, startY, {
        width,
        characterSpacing: 0.7,
      });
  }

  if (
    style.showSectionLines &&
    style.dividerStyle !== "none"
  ) {
    const lineY = doc.y + 3;

    const extraHeight =
      drawSectionDivider(
        doc,
        x,
        lineY,
        width,
        style
      );

    doc.y =
      lineY + extraHeight + 4;
  } else {
    doc.moveDown(0.25);
  }
}

function bullet(
  doc,
  text,
  style,
  options = {}
) {
  checkPage(doc, 45);

  const x =
    options.x ??
    doc.page.margins.left;

  const width =
    options.width ??
    doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right;

  const fontSize =
    options.fontSize ??
    style.bodyFontSize;

  const fonts = getFonts(
    style.fontFamily
  );

  const symbol = getBulletSymbol(
    style.bulletStyle
  );

  doc
    .font(fonts.regular)
    .fontSize(fontSize)
    .fillColor("#334155")
    .text(`${symbol} ${text}`, x, doc.y, {
      width,
      lineGap: style.lineGap,
    });
}

function renderSummary(
  doc,
  data,
  style,
  context
) {
  if (!data.summary) {
    return;
  }

  sectionTitle(
    doc,
    "Professional Summary",
    style,
    context
  );

  const fonts = getFonts(
    style.fontFamily
  );

  doc
    .font(fonts.regular)
    .fontSize(style.bodyFontSize)
    .fillColor("#334155")
    .text(
      data.summary,
      context.x,
      doc.y,
      {
        width: context.width,
        align: "left",
        lineGap: style.lineGap,
      }
    );
}

function renderSkills(
  doc,
  data,
  style,
  context
) {
  const skills = safeArray(data.skills);

  if (skills.length === 0) {
    return;
  }

  sectionTitle(
    doc,
    "Core Skills",
    style,
    context
  );

  const fonts = getFonts(
    style.fontFamily
  );

  if (
    style.skillsLayout === "bullets"
  ) {
    skills.forEach((skill) => {
      bullet(
        doc,
        skill,
        style,
        context
      );
    });

    return;
  }

  if (
    style.skillsLayout === "two-column"
  ) {
    const columnGap = 18;

    const columnWidth =
      (context.width - columnGap) / 2;

    let currentY = doc.y;

    doc
      .font(fonts.regular)
      .fontSize(style.bodyFontSize)
      .fillColor("#334155");

    for (
      let index = 0;
      index < skills.length;
      index += 2
    ) {
      const pageChanged =
        checkPage(doc, 30);

      if (pageChanged) {
        currentY = doc.y;
      }

      const leftSkill =
        skills[index];

      const rightSkill =
        skills[index + 1];

      const symbol =
        getBulletSymbol(
          style.bulletStyle
        );

      const leftText =
        `${symbol} ${leftSkill}`;

      const rightText = rightSkill
        ? `${symbol} ${rightSkill}`
        : "";

      const leftHeight =
        doc.heightOfString(
          leftText,
          {
            width: columnWidth,
            lineGap: style.lineGap,
          }
        );

      const rightHeight =
        rightText
          ? doc.heightOfString(
              rightText,
              {
                width: columnWidth,
                lineGap:
                  style.lineGap,
              }
            )
          : 0;

      doc.text(
        leftText,
        context.x,
        currentY,
        {
          width: columnWidth,
          lineGap: style.lineGap,
        }
      );

      if (rightText) {
        doc.text(
          rightText,
          context.x +
            columnWidth +
            columnGap,
          currentY,
          {
            width: columnWidth,
            lineGap: style.lineGap,
          }
        );
      }

      currentY +=
        Math.max(
          leftHeight,
          rightHeight
        ) + 4;

      doc.y = currentY;
    }

    return;
  }

  const separator =
    style.skillsLayout ===
    "comma-separated"
      ? ", "
      : "  •  ";

  doc
    .font(fonts.regular)
    .fontSize(style.bodyFontSize)
    .fillColor("#334155")
    .text(
      skills.join(separator),
      context.x,
      doc.y,
      {
        width: context.width,
        lineGap: style.lineGap,
      }
    );
}

function renderExperience(
  doc,
  data,
  style,
  context
) {
  const experienceItems =
    safeArray(data.experience);

  if (experienceItems.length === 0) {
    return;
  }

  sectionTitle(
    doc,
    "Professional Experience",
    style,
    context
  );

  const fonts = getFonts(
    style.fontFamily
  );

  experienceItems.forEach(
    (experience) => {
      checkPage(doc, 90);

      doc
        .font(fonts.bold)
        .fontSize(
          style.bodyFontSize + 0.8
        )
        .fillColor("#111827")
        .text(
          experience.role || "Role",
          context.x,
          doc.y,
          {
            width: context.width,
          }
        );

      const companyDetails = [
        experience.company,
        experience.duration,
      ]
        .filter(Boolean)
        .join(" | ");

      if (companyDetails) {
        doc
          .font(fonts.regular)
          .fontSize(
            Math.max(
              style.bodyFontSize - 1,
              8
            )
          )
          .fillColor("#64748b")
          .text(
            companyDetails,
            context.x,
            doc.y,
            {
              width: context.width,
            }
          );
      }

      safeArray(
        experience.bullets
      ).forEach((item) => {
        bullet(
          doc,
          item,
          style,
          context
        );
      });

      doc.moveDown(
        style.sectionSpacing
      );
    }
  );
}

function renderProjects(
  doc,
  data,
  style,
  context
) {
  const projects =
    safeArray(data.projects);

  if (projects.length === 0) {
    return;
  }

  const fonts = getFonts(
    style.fontFamily
  );

  const firstProject =
    projects[0];

  const firstProjectName =
    firstProject?.name ||
    "Project";

  const firstProjectDescription =
    firstProject?.description || "";

  doc
    .font(fonts.bold)
    .fontSize(
      style.bodyFontSize + 0.5
    );

  const firstNameHeight =
    doc.heightOfString(
      firstProjectName,
      {
        width: context.width,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(style.bodyFontSize);

  const firstDescriptionHeight =
    firstProjectDescription
      ? doc.heightOfString(
          firstProjectDescription,
          {
            width: context.width,
            lineGap: style.lineGap,
          }
        )
      : 0;
  sectionTitle(
    doc,
    "Projects",
    style,
    {
      ...context,

      keepWithNext:
        firstNameHeight +
        firstDescriptionHeight +
        18,
    }
  );
  projects.forEach(
    (project, index) => {
      if (index > 0) {
        const projectName =
          project.name ||
          "Project";

        const projectDescription =
          project.description || "";

        doc
          .font(fonts.bold)
          .fontSize(
            style.bodyFontSize + 0.5
          );

        const nameHeight =
          doc.heightOfString(
            projectName,
            {
              width:
                context.width,
            }
          );

        doc
          .font(fonts.regular)
          .fontSize(
            style.bodyFontSize
          );

        const descriptionHeight =
          projectDescription
            ? doc.heightOfString(
                projectDescription,
                {
                  width:
                    context.width,
                  lineGap:
                    style.lineGap,
                }
              )
            : 0;

        checkPage(
          doc,
          nameHeight +
            descriptionHeight +
            18
        );
      }

      doc
        .font(fonts.bold)
        .fontSize(
          style.bodyFontSize + 0.5
        )
        .fillColor("#111827")
        .text(
          project.name ||
            "Project",
          context.x,
          doc.y,
          {
            width:
              context.width,
          }
        );

      if (project.description) {
        doc
          .font(fonts.regular)
          .fontSize(
            style.bodyFontSize
          )
          .fillColor("#334155")
          .text(
            project.description,
            context.x,
            doc.y,
            {
              width:
                context.width,
              lineGap:
                style.lineGap,
            }
          );
      }
      doc.moveDown(
        style.sectionSpacing
      );
    }
  );
}

function renderEducation(
  doc,
  data,
  style,
  context
) {
  const educationItems =
    safeArray(data.education);

  if (educationItems.length === 0) {
    return;
  }

  sectionTitle(
    doc,
    "Education",
    style,
    context
  );

  const fonts = getFonts(
    style.fontFamily
  );

  educationItems.forEach(
    (education) => {
      checkPage(doc, 50);

      doc
        .font(fonts.bold)
        .fontSize(
          style.bodyFontSize + 0.4
        )
        .fillColor("#111827")
        .text(
          education.degree ||
            "Degree",
          context.x,
          doc.y,
          {
            width: context.width,
          }
        );

      const educationDetails = [
        education.institution,
        education.year,
      ]
        .filter(Boolean)
        .join(" | ");

      if (educationDetails) {
        doc
          .font(fonts.regular)
          .fontSize(
            Math.max(
              style.bodyFontSize - 1,
              8
            )
          )
          .fillColor("#64748b")
          .text(
            educationDetails,
            context.x,
            doc.y,
            {
              width: context.width,
            }
          );
      }

      doc.moveDown(
        style.sectionSpacing
      );
    }
  );
}

function renderCertifications(
  doc,
  data,
  style,
  context
) {
  const certifications =
    safeArray(data.certifications);

  if (
    certifications.length === 0
  ) {
    return;
  }

  sectionTitle(
    doc,
    "Certifications",
    style,
    context
  );

  certifications.forEach(
    (certification) => {
      bullet(
        doc,
        certification,
        style,
        context
      );
    }
  );
}

function renderAchievements(
  doc,
  data,
  style,
  context
) {
  const achievements =
    safeArray(data.achievements);

  if (achievements.length === 0) {
    return;
  }

  sectionTitle(
    doc,
    "Achievements",
    style,
    context
  );

  achievements.forEach(
    (achievement) => {
      bullet(
        doc,
        achievement,
        style,
        context
      );
    }
  );
}

const SECTION_RENDERERS = {
  summary: renderSummary,
  skills: renderSkills,
  experience: renderExperience,
  projects: renderProjects,
  education: renderEducation,
  certifications:
    renderCertifications,
  achievements: renderAchievements,
};

function renderMainSections(
  doc,
  data,
  style,
  options = {}
) {
  const context = {
    x:
      options.x ??
      doc.page.margins.left,

    width:
      options.width ??
      doc.page.width -
        doc.page.margins.left -
        doc.page.margins.right,
  };

  const includeSkills =
    options.includeSkills !== false;

  const configuredOrder =
    Array.isArray(style?.sectionOrder)
      ? style.sectionOrder.filter(
          (sectionName) =>
            DEFAULT_SECTION_ORDER.includes(
              sectionName
            )
        )
      : [];
  const sectionOrder =
    configuredOrder.length > 0
      ? configuredOrder
      : DEFAULT_SECTION_ORDER;

  sectionOrder.forEach(
    (sectionName) => {
      if (
        !isSectionVisible(
          style,
          sectionName
        )
      ) {
        return;
      }

      if (
        sectionName === "skills" &&
        !includeSkills
      ) {
        return;
      }

      const renderer =
        SECTION_RENDERERS[
          sectionName
        ];

      if (renderer) {
        renderer(
          doc,
          data,
          style,
          context
        );
      }
    }
  );
}
function getHeaderColors(style) {
  if (
    style.headerBackground ===
    "accent"
  ) {
    return {
      background:
        style.accentColor,
      name: "#ffffff",
      title: "#ffffff",
      contact: "#f8fafc",
    };
  }

  if (
    style.headerBackground ===
    "tint"
  ) {
    return {
      background: lightenHex(
        style.accentColor,
        0.88
      ),
      name: "#111827",
      title: style.accentColor,
      contact: "#64748b",
    };
  }

  return {
    background: null,
    name: "#111827",
    title: style.accentColor,
    contact: "#64748b",
  };
}

function drawExecutiveTemplate(
  doc,
  data,
  style
) {
  const fonts = getFonts(
    style.fontFamily
  );

  const colors =
    getHeaderColors(style);

  const contentX =
    doc.page.margins.left;

  const contentWidth =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  const headerHeight = 108;

  if (colors.background) {
    doc
      .rect(
        0,
        0,
        doc.page.width,
        headerHeight
      )
      .fill(colors.background);
  }

  doc
    .font(fonts.bold)
    .fontSize(style.nameFontSize)
    .fillColor(colors.name)
    .text(
      data.fullName ||
        "Candidate Name",
      contentX,
      26,
      {
        width: contentWidth,
        align:
          style.headerAlignment,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(
      Math.max(
        style.bodyFontSize + 1.5,
        10
      )
    )
    .fillColor(colors.title)
    .text(
      data.title ||
        "Professional Candidate",
      contentX,
      60,
      {
        width: contentWidth,
        align:
          style.headerAlignment,
      }
    );

  const contact = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.portfolio,
  ]
    .filter(Boolean)
    .join(
      getContactSeparator(
        style.contactSeparator
      )
    );

  if (contact) {
    doc
      .font(fonts.regular)
      .fontSize(
        Math.max(
          style.bodyFontSize - 1.5,
          8
        )
      )
      .fillColor(colors.contact)
      .text(
        contact,
        contentX,
        82,
        {
          width: contentWidth,
          align:
            style.headerAlignment,
        }
      );
  }

  doc.y = headerHeight + 7;

  renderMainSections(
    doc,
    data,
    style,
    {
      x: contentX,
      width: contentWidth,
    }
  );
}

function drawClassicTemplate(
  doc,
  data,
  style
) {
  const fonts = getFonts(
    style.fontFamily
  );

  const colors =
    getHeaderColors(style);

  const contentX =
    doc.page.margins.left;

  const contentWidth =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  if (colors.background) {
    doc
      .rect(
        0,
        0,
        doc.page.width,
        115
      )
      .fill(colors.background);

    doc.y = 26;
  }

  doc
    .font(fonts.bold)
    .fontSize(style.nameFontSize)
    .fillColor(colors.name)
    .text(
      data.fullName ||
        "Candidate Name",
      contentX,
      doc.y,
      {
        width: contentWidth,
        align:
          style.headerAlignment,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(
      Math.max(
        style.bodyFontSize + 0.5,
        10
      )
    )
    .fillColor(colors.title)
    .text(
      data.title ||
        "Professional Candidate",
      contentX,
      doc.y,
      {
        width: contentWidth,
        align:
          style.headerAlignment,
      }
    );

  const contact = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.portfolio,
  ]
    .filter(Boolean)
    .join(
      getContactSeparator(
        style.contactSeparator
      )
    );

  if (contact) {
    doc
      .font(fonts.regular)
      .fontSize(
        Math.max(
          style.bodyFontSize - 1,
          8
        )
      )
      .fillColor(colors.contact)
      .text(
        contact,
        contentX,
        doc.y,
        {
          width: contentWidth,
          align:
            style.headerAlignment,
        }
      );
  }

  if (colors.background) {
    doc.y = 120;
  } else {
    doc.moveDown(0.8);
  }

  drawSectionDivider(
    doc,
    contentX,
    doc.y,
    contentWidth,
    {
      ...style,
      showSectionLines: true,

      dividerStyle:
        style.dividerStyle ===
        "none"
          ? "solid"
          : style.dividerStyle,
    }
  );

  doc.moveDown(0.5);

  renderMainSections(
    doc,
    data,
    style,
    {
      x: contentX,
      width: contentWidth,
    }
  );
}

function drawSidebarTemplate(
  doc,
  data,
  style
) {
  const fonts = getFonts(
    style.fontFamily
  );

  const sidebarWidth = 185;
  const sidebarX = 28;
  const sidebarTextWidth = 130;

  const mainX = 215;

  const mainWidth =
    doc.page.width -
    mainX -
    doc.page.margins.right;

  let sidebarBackground =
    "#ffffff";

  let sidebarTextColor =
    "#334155";

  let sidebarHeadingColor =
    "#111827";

  if (
    style.headerBackground ===
    "accent"
  ) {
    sidebarBackground =
      style.accentColor;

    sidebarTextColor =
      "#f8fafc";

    sidebarHeadingColor =
      "#ffffff";
  } else if (
    style.headerBackground ===
    "tint"
  ) {
    sidebarBackground =
      lightenHex(
        style.accentColor,
        0.88
      );
  }

  doc
    .rect(
      0,
      0,
      sidebarWidth,
      doc.page.height
    )
    .fill(sidebarBackground);

  doc
    .rect(
      0,
      0,
      12,
      doc.page.height
    )
    .fill(style.accentColor);

  doc
    .font(fonts.bold)
    .fontSize(style.nameFontSize)
    .fillColor(
      sidebarHeadingColor
    )
    .text(
      data.fullName ||
        "Candidate Name",
      sidebarX,
      38,
      {
        width: sidebarTextWidth,
        align:
          style.headerAlignment,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(style.bodyFontSize)
    .fillColor(
      style.headerBackground ===
      "accent"
        ? "#ffffff"
        : style.accentColor
    )
    .text(
      data.title ||
        "Professional Candidate",
      sidebarX,
      doc.y + 7,
      {
        width: sidebarTextWidth,
        align:
          style.headerAlignment,
      }
    );

  doc.moveDown(1.2);

  doc
    .font(fonts.bold)
    .fontSize(
      style.headingFontSize
    )
    .fillColor(
      sidebarHeadingColor
    )
    .text(
      "CONTACT",
      sidebarX,
      doc.y,
      {
        width: sidebarTextWidth,
      }
    );

  doc.moveDown(0.4);

  [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.portfolio,
  ]
    .filter(Boolean)
    .forEach((item) => {
      doc
        .font(fonts.regular)
        .fontSize(
          Math.max(
            style.bodyFontSize - 1,
            8
          )
        )
        .fillColor(
          sidebarTextColor
        )
        .text(
          item,
          sidebarX,
          doc.y,
          {
            width:
              sidebarTextWidth,
            lineGap:
              style.lineGap,
          }
        );

      doc.moveDown(0.3);
    });

  if (
    isSectionVisible(
      style,
      "skills"
    ) &&
    safeArray(data.skills).length > 0
  ) {
    doc.moveDown(0.8);

    doc
      .font(fonts.bold)
      .fontSize(
        style.headingFontSize
      )
      .fillColor(
        sidebarHeadingColor
      )
      .text(
        "SKILLS",
        sidebarX,
        doc.y,
        {
          width:
            sidebarTextWidth,
        }
      );

    doc.moveDown(0.4);

    safeArray(
      data.skills
    ).forEach((skill) => {
      doc
        .font(fonts.regular)
        .fontSize(
          Math.max(
            style.bodyFontSize - 1,
            8
          )
        )
        .fillColor(
          sidebarTextColor
        )
        .text(
          `${getBulletSymbol(
            style.bulletStyle
          )} ${skill}`,
          sidebarX,
          doc.y,
          {
            width:
              sidebarTextWidth,
            lineGap:
              style.lineGap,
          }
        );
    });
  }

  doc.x = mainX;
  doc.y = 35;

  renderMainSections(
    doc,
    data,
    style,
    {
      x: mainX,
      width: mainWidth,
      includeSkills: false,
    }
  );
}

function applyResumeTemplate(
  doc,
  template,
  resumeData,
  styleConfig
) {
  if (template === "classic") {
    drawClassicTemplate(
      doc,
      resumeData,
      styleConfig
    );

    return;
  }

  if (template === "sidebar") {
    drawSidebarTemplate(
      doc,
      resumeData,
      styleConfig
    );

    return;
  }

  drawExecutiveTemplate(
    doc,
    resumeData,
    styleConfig
  );
}

module.exports = {
  applyResumeTemplate,
};