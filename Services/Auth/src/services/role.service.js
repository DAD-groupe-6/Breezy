const { Role, Permission, RolePermission } = require("../models");
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

module.exports = { listRoles, checkPermission, checkPermissionByName };
