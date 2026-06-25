const RoleService = require("../services/role.service");

/**
 * Liste les rôles assignables.
 * Entrée : rien
 * Sortie : 200 { roles }
 */
async function listRoles(req, res) {
    try {
        const roles = await RoleService.listRoles();
        res.status(200).json({ roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * Dit si un rôle a une permission (par id).
 * Entrée : req.params { roleId, permissionId }
 * Sortie : 200 { hasPermission } ; 400 si paramètre manquant
 */
async function checkPermission(req, res) {
    try {
        const { roleId, permissionId } = req.params;

        if (!roleId || !permissionId) {
            return res.status(400).json({
                message: "roleId and permissionId are required"
            });
        }

        const hasPermission = await RoleService.checkPermission(
            parseInt(roleId),
            parseInt(permissionId)
        );

        res.status(200).json({ hasPermission });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * Dit si un rôle a une permission (par nom).
 * Entrée : req.params { roleId, permissionName }
 * Sortie : 200 { hasPermission } ; 400 si paramètre manquant, 404 si permission inconnue
 */
async function checkPermissionByName(req, res) {
    try {
        const { roleId, permissionName } = req.params;

        if (!roleId || !permissionName) {
            return res.status(400).json({
                message: "roleId and permissionName are required"
            });
        }

        const hasPermission = await RoleService.checkPermissionByName(
            parseInt(roleId),
            permissionName
        );

        res.status(200).json({ hasPermission });
    } catch (err) {
        const status = err.message === "Permission not found" ? 404 : 500;
        res.status(status).json({ message: err.message });
    }
}

/**
 * Renvoie les noms de permissions d'un rôle.
 * Entrée : req.params { roleId }
 * Sortie : 200 { permissions } ; 400 si manquant, 404 si rôle inconnu
 */
async function getRolePermissions(req, res) {
    try {
        const { roleId } = req.params;

        if (!roleId) {
            return res.status(400).json({ message: "roleId is required" });
        }

        const permissions = await RoleService.getRolePermissions(parseInt(roleId));
        res.status(200).json({ permissions });
    } catch (err) {
        const status = err.message === "Role not found" ? 404 : 500;
        res.status(status).json({ message: err.message });
    }
}

/**
 * Dit si l'utilisateur a une permission (par userId).
 * Entrée : req.params { userId, permissionName }
 * Sortie : 200 { hasPermission } ; 400 si manquant, 404 si user/permission inconnu
 */
async function checkPermissionByUserId(req, res) {
    try {
        const { userId, permissionName } = req.params;

        if (!userId || !permissionName) {
            return res.status(400).json({
                message: "userId and permissionName are required"
            });
        }

        const hasPermission = await RoleService.checkPermissionByUserId(
            parseInt(userId),
            permissionName
        );

        res.status(200).json({ hasPermission });
    } catch (err) {
        const status = err.message === "Permission not found" || err.message === "User not found" ? 404 : 500;
        res.status(status).json({ message: err.message });
    }
}

/**
 * Traduit un message d'erreur métier en code HTTP.
 * Entrée : message (string)
 * Sortie : status (number)
 */
function adminErrorStatus(message) {
    if (["Role not found"].includes(message)) return 404;
    if (["Role already exists", "Role has assigned users"].includes(message)) return 409;
    if ([
        "Role name is required",
        "Unknown permission",
        "Cannot delete a core role",
        "Cannot rename a core role",
        "Cannot remove your own admin access",
    ].includes(message)) return 400;
    return 500;
}

/**
 * Liste tous les rôles avec leurs permissions (admin).
 * Entrée : rien
 * Sortie : 200 { roles }
 */
async function adminListRoles(req, res) {
    try {
        const roles = await RoleService.listRolesDetailed();
        res.status(200).json({ roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * Liste toutes les permissions (admin).
 * Entrée : rien
 * Sortie : 200 { permissions }
 */
async function adminListPermissions(req, res) {
    try {
        const permissions = await RoleService.listPermissions();
        res.status(200).json({ permissions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * Crée un rôle (admin).
 * Entrée : req.body { name, description, permissions }
 * Sortie : 201 { role } ; 4xx via adminErrorStatus
 */
async function adminCreateRole(req, res) {
    try {
        const { name, description, permissions } = req.body;
        const role = await RoleService.createRole({ name, description, permissions });
        res.status(201).json({ role });
    } catch (err) {
        res.status(adminErrorStatus(err.message)).json({ message: err.message });
    }
}

/**
 * Met à jour un rôle (admin).
 * Entrée : req.params { roleId }, req.body { name, description, permissions }, req.user.roleId
 * Sortie : 200 { role } ; 4xx via adminErrorStatus
 */
async function adminUpdateRole(req, res) {
    try {
        const { name, description, permissions } = req.body;
        const role = await RoleService.updateRole(
            parseInt(req.params.roleId),
            { name, description, permissions },
            req.user.roleId
        );
        res.status(200).json({ role });
    } catch (err) {
        res.status(adminErrorStatus(err.message)).json({ message: err.message });
    }
}

/**
 * Supprime un rôle (admin).
 * Entrée : req.params { roleId }
 * Sortie : 204 ; 4xx via adminErrorStatus
 */
async function adminDeleteRole(req, res) {
    try {
        await RoleService.deleteRole(parseInt(req.params.roleId));
        res.status(204).end();
    } catch (err) {
        res.status(adminErrorStatus(err.message)).json({ message: err.message });
    }
}

module.exports = {
    listRoles,
    getRolePermissions,
    checkPermission,
    checkPermissionByName,
    checkPermissionByUserId,
    adminListRoles,
    adminListPermissions,
    adminCreateRole,
    adminUpdateRole,
    adminDeleteRole,
};
