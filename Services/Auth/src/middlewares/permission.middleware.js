const RoleService = require("../services/role.service");

/**
 * Construit un middleware qui exige une permission sur le rôle de l'utilisateur,
 * lue directement en base (Auth est la source de vérité).
 * Entrée : permissionName (string)
 * Sortie : middleware (function) (req, res, next) — 401/403/500 sinon next()
 */
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
