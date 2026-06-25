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

// =====================================================================
//  Administration RBAC (réservé à la permission `manage_roles`)
// =====================================================================

// Rôles "noyau" : on interdit leur suppression/renommage pour ne pas casser le seed
// ni la logique métier des services (qui raisonnent par nom de permission, pas de rôle).
const CORE_ROLES = ["visiteur", "utilisateur", "moderateur", "administrateur"];

// Renvoie un rôle avec ses permissions (id + nom + description).
async function getRoleDetailed(roleId) {
    return Role.findByPk(roleId, {
        attributes: ["id", "name", "description"],
        include: [{ model: Permission, as: "permissions", attributes: ["id", "name", "description"], through: { attributes: [] } }],
    });
}

// Liste tous les rôles (y compris visiteur) avec leurs permissions. Utilisé par la page d'admin.
async function listRolesDetailed() {
    return Role.findAll({
        attributes: ["id", "name", "description"],
        include: [{ model: Permission, as: "permissions", attributes: ["id", "name", "description"], through: { attributes: [] } }],
        order: [["id", "ASC"]],
    });
}

async function listPermissions() {
    return Permission.findAll({
        attributes: ["id", "name", "description"],
        order: [["id", "ASC"]],
    });
}

// Convertit une liste de noms de permissions en instances (erreur si l'une est inconnue).
async function resolvePermissions(names) {
    if (!Array.isArray(names)) return [];
    const unique = [...new Set(names)];
    if (unique.length === 0) return [];
    const perms = await Permission.findAll({ where: { name: unique } });
    if (perms.length !== unique.length) {
        throw new Error("Unknown permission");
    }
    return perms;
}

async function createRole({ name, description, permissions }) {
    if (!name || !name.trim()) throw new Error("Role name is required");
    const clean = name.trim();
    if (await Role.findOne({ where: { name: clean } })) throw new Error("Role already exists");

    const role = await Role.create({ name: clean, description: description || null });
    if (permissions !== undefined) {
        await role.setPermissions(await resolvePermissions(permissions));
    }
    return getRoleDetailed(role.id);
}

// requesterRoleId : rôle de l'admin qui édite, pour éviter qu'il ne se retire son propre accès.
async function updateRole(roleId, { name, description, permissions }, requesterRoleId) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error("Role not found");

    if (name !== undefined && name.trim() && name.trim() !== role.name) {
        if (CORE_ROLES.includes(role.name)) throw new Error("Cannot rename a core role");
        if (await Role.findOne({ where: { name: name.trim() } })) throw new Error("Role already exists");
        role.name = name.trim();
    }
    if (description !== undefined) role.description = description;
    await role.save();

    if (permissions !== undefined) {
        // Garde-fou anti-verrouillage : un admin ne peut pas retirer `manage_roles` à son propre rôle.
        if (Number(roleId) === Number(requesterRoleId) && !permissions.includes("manage_roles")) {
            throw new Error("Cannot remove your own admin access");
        }
        await role.setPermissions(await resolvePermissions(permissions));
    }
    return getRoleDetailed(role.id);
}

async function deleteRole(roleId) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error("Role not found");
    if (CORE_ROLES.includes(role.name)) throw new Error("Cannot delete a core role");
    if (await User.count({ where: { roleId } }) > 0) throw new Error("Role has assigned users");
    await role.destroy();
}

module.exports = {
    listRoles,
    getRolePermissions,
    checkPermission,
    checkPermissionByName,
    checkPermissionByUserId,
    // Administration RBAC
    listRolesDetailed,
    listPermissions,
    createRole,
    updateRole,
    deleteRole,
};
