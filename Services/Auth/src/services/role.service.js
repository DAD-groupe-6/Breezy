const { Role, Permission, RolePermission, User } = require("../models");
const { Op } = require("sequelize");

/**
 * Liste les rôles assignables (exclut visiteur/visitor).
 * Entrée : rien
 * Sortie : roles (array) [{ id, name, description }]
 */
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

/**
 * Dit si un rôle possède une permission donnée (par id).
 * Entrée : roleId (number), permissionId (number)
 * Sortie : hasPermission (boolean)
 */
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

/**
 * Dit si un rôle possède une permission donnée (par nom).
 * Entrée : roleId (number), permissionName (string)
 * Sortie : hasPermission (boolean)
 */
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

/**
 * Renvoie les noms de permissions d'un rôle (sert au front pour piloter l'affichage).
 * Entrée : roleId (number)
 * Sortie : names (array de string)
 */
async function getRolePermissions(roleId) {
    const role = await Role.findByPk(roleId, {
        include: [{ model: Permission, as: "permissions", attributes: ["name"], through: { attributes: [] } }],
    });
    if (!role) {
        throw new Error("Role not found");
    }
    return role.permissions.map((p) => p.name);
}

/**
 * Comme checkPermissionByName mais en partant d'un userId : résout son rôle puis la permission.
 * Entrée : userId (number), permissionName (string)
 * Sortie : hasPermission (boolean)
 */
async function checkPermissionByUserId(userId, permissionName) {
    const user = await User.findByPk(userId, { attributes: ["id", "roleId"] });
    if (!user) {
        throw new Error("User not found");
    }
    return checkPermissionByName(user.roleId, permissionName);
}

const CORE_ROLES = ["visiteur", "utilisateur", "moderateur", "administrateur"];

/**
 * Renvoie un rôle avec le détail de ses permissions.
 * Entrée : roleId (number)
 * Sortie : role (object) { id, name, description, permissions: [{ id, name, description }] }
 */
async function getRoleDetailed(roleId) {
    return Role.findByPk(roleId, {
        attributes: ["id", "name", "description"],
        include: [{ model: Permission, as: "permissions", attributes: ["id", "name", "description"], through: { attributes: [] } }],
    });
}

/**
 * Liste tous les rôles (visiteur inclus) avec leurs permissions, pour la page d'admin.
 * Entrée : rien
 * Sortie : roles (array) [{ id, name, description, permissions }]
 */
async function listRolesDetailed() {
    return Role.findAll({
        attributes: ["id", "name", "description"],
        include: [{ model: Permission, as: "permissions", attributes: ["id", "name", "description"], through: { attributes: [] } }],
        order: [["id", "ASC"]],
    });
}

/**
 * Liste toutes les permissions existantes.
 * Entrée : rien
 * Sortie : permissions (array) [{ id, name, description }]
 */
async function listPermissions() {
    return Permission.findAll({
        attributes: ["id", "name", "description"],
        order: [["id", "ASC"]],
    });
}

/**
 * Convertit des noms de permissions en instances (erreur si l'une est inconnue).
 * Entrée : names (array de string)
 * Sortie : perms (array d'instances Permission)
 */
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

/**
 * Crée un rôle et lui affecte ses permissions.
 * Entrée : data (object) { name, description, permissions: [string] }
 * Sortie : role (object) détaillé
 */
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

/**
 * Met à jour un rôle (un rôle noyau ne peut être renommé ; un admin ne peut se retirer
 * manage_roles à lui-même).
 * Entrée : roleId (number), data (object) { name, description, permissions },
 *          requesterRoleId (number, rôle de l'admin qui édite)
 * Sortie : role (object) détaillé
 */
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
        if (Number(roleId) === Number(requesterRoleId) && !permissions.includes("manage_roles")) {
            throw new Error("Cannot remove your own admin access");
        }
        await role.setPermissions(await resolvePermissions(permissions));
    }
    return getRoleDetailed(role.id);
}

/**
 * Supprime un rôle (interdit pour un rôle noyau ou si des utilisateurs y sont rattachés).
 * Entrée : roleId (number)
 * Sortie : rien
 */
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
    listRolesDetailed,
    listPermissions,
    createRole,
    updateRole,
    deleteRole,
};
