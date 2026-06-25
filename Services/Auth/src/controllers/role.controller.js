const RoleService = require("../services/role.service");

async function listRoles(req, res) {
    try {
        const roles = await RoleService.listRoles();
        res.status(200).json({ roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

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

// =====================================================================
//  Administration RBAC (réservé à la permission `manage_roles`)
// =====================================================================

// Traduit les erreurs métier en codes HTTP cohérents.
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

async function adminListRoles(req, res) {
    try {
        const roles = await RoleService.listRolesDetailed();
        res.status(200).json({ roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function adminListPermissions(req, res) {
    try {
        const permissions = await RoleService.listPermissions();
        res.status(200).json({ permissions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function adminCreateRole(req, res) {
    try {
        const { name, description, permissions } = req.body;
        const role = await RoleService.createRole({ name, description, permissions });
        res.status(201).json({ role });
    } catch (err) {
        res.status(adminErrorStatus(err.message)).json({ message: err.message });
    }
}

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
    // Administration RBAC
    adminListRoles,
    adminListPermissions,
    adminCreateRole,
    adminUpdateRole,
    adminDeleteRole,
};
