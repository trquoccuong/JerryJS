"use strict";

module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define("user", {
        id : {type : DataTypes.INTEGER ,
            primaryKey : true,
        autoIncrement :true} ,
        name: DataTypes.STRING(60)
    }, {
        timestamps: false,
        freezeTableName: true
    });
    User.sync();
    return User;
};
