module.exports = (Sequelize, sequelize) => {
    const User = sequelize.define('user', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        dob: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        location: {
            type: Sequelize.STRING,
            allowNull: true
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isPhoneVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isEmailVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        role: {
            type: Sequelize.STRING,
            defaultValue: "user"
        },
        plan: {
            type: Sequelize.STRING,
            defaultValue: "free"
        },
        isBlocked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        freeUsesLeft: {
            type: Sequelize.INTEGER,
            defaultValue: 5
        },
        proUsesLeft: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        totalUses: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        country:{
            type:Sequelize.STRING,
        },
        state:{
            type:Sequelize.STRING,
        },
        city:{
            type:Sequelize.STRING,
        }
    });
    return User;
}