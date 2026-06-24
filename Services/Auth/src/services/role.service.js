const { Role, Permission, RolePermission, User } = require("../models");
const { Op } = require("sequelize");

async function listRoles() {
    try {
        return await Role.findAll({
            attributes: ["id", "name", "description"],
            where: {
                name: {
                    [Op.notIn]: ["visiteur", "visitor"],
                },
            },
            order: [["id", "ASC"]],
        });
    } catch (err) {
        throw new Error(`Error listing roles: ${err.message}`);
    }
}

async function checkPermission(roleId, permissionId) {
    try {
        const rolePermission = await RolePermission.findOne({
            where: {
                roleId: roleId,
                permissionId: permissionId,
            },
        });

        return rolePermission !== null;
    } catch (err) {
        throw new Error(`Error checking permission: ${err.message}`);
    }
}

async function checkPermissionByName(roleId, permissionName) {
    try {
        const permission = await Permission.findOne({
            where: { name: permissionName },
        });

        if (!permission) {
            throw new Error("Permission not found");
        }

        return checkPermission(roleId, permission.id);
    } catch (err) {
        throw new Error(`Error checking permission: ${err.message}`);
    }
}

// Liste les noms de permissions d'un rôle. Utilisé par le front pour piloter l'affichage.
async function getRolePermissions(roleId) {
    const role = await Role.findByPk(roleId, {
        include: [{ model: Permission, as: "permissions", attributes: ["name"], through: { attributes: [] } }],
    });
    if (!role) {
        throw new Error("Role not found");
    }
    return role.permissions.map((p) => p.name);
}

// Comme checkPermissionByName, mais en partant d'un userId : on résout son rôle puis sa permission.
// Utile aux services qui ne connaissent qu'un userId (ex: Notification → rôle du destinataire).
async function checkPermissionByUserId(userId, permissionName) {
    const user = await User.findByPk(userId, { attributes: ["id", "roleId"] });
    if (!user) {
        throw new Error("User not found");
    }
    return checkPermissionByName(user.roleId, permissionName);
}

module.exports = { listRoles, getRolePermissions, checkPermission, checkPermissionByName, checkPermissionByUserId };
