const User = require("./user.model");
const Role = require("./role.model");
const Permission = require("./permission.model");
const RolePermission = require("./rolePermission.model");

const initializeAssociations = () => {
    // User belongs to Role
    User.belongsTo(Role, {
        foreignKey: "roleId",
        as: "role",
    });

    // Role has many Users
    Role.hasMany(User, {
        foreignKey: "roleId",
        as: "users",
    });

    // Role has many Permissions (through RolePermission)
    Role.belongsToMany(Permission, {
        through: RolePermission,
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: "permissions",
    });

    // Permission has many Roles (through RolePermission)
    Permission.belongsToMany(Role, {
        through: RolePermission,
        foreignKey: "permissionId",
        otherKey: "roleId",
        as: "roles",
    });
};

module.exports = { initializeAssociations, User, Role, Permission, RolePermission };
