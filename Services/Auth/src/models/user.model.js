const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");
const Role = require("./role.model");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    roleId: {
        type: DataTypes.INTEGER,
        references: {
            model: Role,
            key: "id",
        },
        onDelete: "SET NULL",
    },
}, {
    tableName: "users",
    timestamps: true,
});

module.exports = User;