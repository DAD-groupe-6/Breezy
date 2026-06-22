const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const Role = sequelize.define("Role", {
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
    tableName: "roles",
    timestamps: true,
});

module.exports = Role;
