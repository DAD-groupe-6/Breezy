const RoleService = require("../services/role.service");

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

module.exports = { checkPermission, checkPermissionByName };
