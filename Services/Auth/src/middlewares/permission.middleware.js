const RoleService = require("../services/role.service");

// Vérifie une permission via le rôle de l'utilisateur. Auth étant la source de vérité,
// on interroge directement la base (pas d'appel HTTP vers soi-même).
const requirePermission = (permissionName) => async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const ok = await RoleService.checkPermissionByName(req.user.roleId, permissionName);
        if (!ok) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: "Permission check failed" });
    }
};

module.exports = { requirePermission };
