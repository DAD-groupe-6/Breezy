const User = require("./user.model");
const Role = require("./role.model");
const Permission = require("./permission.model");
const RolePermission = require("./rolePermission.model");

/**
 * Déclare les associations Sequelize (User↔Role, Role↔Permission via RolePermission).
 * Entrée : rien
 * Sortie : rien
 */
const initializeAssociations = () => {
    User.belongsTo(Role, {
        foreignKey: "roleId",
        as: "role",
    });

    Role.hasMany(User, {
        foreignKey: "roleId",
        as: "users",
    });

    Role.belongsToMany(Permission, {
        through: RolePermission,
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: "permissions",
    });

    Permission.belongsToMany(Role, {
        through: RolePermission,
        foreignKey: "permissionId",
        otherKey: "roleId",
        as: "roles",
    });
};

module.exports = { initializeAssociations, User, Role, Permission, RolePermission };
