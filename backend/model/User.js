module.exports=(Sequelize,sequelize)=>{
    const User=sequelize.define('user',{
        name:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        email:{
            type:Sequelize.STRING,
            allowNull: false,
            unique:true,
        },
        password:{
                type:Sequelize.STRING,
                allowNull:false
        },
        dob:{
            type:Sequelize.DATEONLY,
            allowNull:false
        }
    });
    return User;
}