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
            allowNull: false
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
            defaultValue: false
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
        }
    });
    return User;
}