const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");
const Role = require("./role.model");
const Permission = require("./permission.model");

const RolePermission = sequelize.define("RolePermission", {
    roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Role,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    permissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Permission,
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    tableName: "role_permissions",
    timestamps: false,
});

module.exports = RolePermission;
