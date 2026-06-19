const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const Permission = sequelize.define("Permission", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "permissions",
    timestamps: true,
});

module.exports = Permission;
