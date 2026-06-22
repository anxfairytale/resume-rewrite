const Sequelize=require("sequelize")
const sequelize=require('../db')
const db={}
db.sequelize=sequelize;
db.Sequelize=Sequelize;
db.User=require('./User')(Sequelize,sequelize);
db.Resume=require("./Resume")(Sequelize,sequelize);
db.Setting=require("./Setting")(sequelize,Sequelize);
db.User.hasMany(db.Resume,{
    foreignKey:"userId",
});
db.Resume.belongsTo(db.User,{
    foreignKey:"userId"
});
module.exports=db;