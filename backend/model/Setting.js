module.exports=(sequelize,Sequelize)=>{
    const Setting=sequelize.define("Setting",{
        freeTrialUses:{
            type:Sequelize.INTEGER,
            defaultValue:3,
        },
        paidAmount:{
            type:Sequelize.INTEGER,
            defaultValue:99
        },
        proUses:{
            type:Sequelize.INTEGER,
            defaultValue:10
        }
    });
    return Setting;
}