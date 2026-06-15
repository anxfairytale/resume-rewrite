module.exports = (Sequelize, sequelize) => {
  const Resume = sequelize.define("resume", {
    originalFileName: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    originalFilePath: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    jobDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    skills: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    resumeData: {
      type: Sequelize.TEXT("long"),
      allowNull: false,
    },

    generatedPdfPath: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    generatedPdfUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    template: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "executive",
    },
  });

  return Resume;
};