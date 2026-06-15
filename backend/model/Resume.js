module.exports = (Sequelize, sequelize) => {
    const Resume = sequelize.define("resume", {
        originalFileName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        originalFilePath: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        jobDescription: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        skills: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        rewrittenResume: {
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
            allowNull: true,
            defaultValue: "modern",
        },
    });
    return Resume;
}