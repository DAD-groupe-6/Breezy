const { userHasPermission } = require("../utils/permission.util");

const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

/**
 * Construit un middleware exigeant une permission (les appels internes x-internal-secret passent).
 * Délègue à userHasPermission (permission.util), qui gère le cache et la dégradation gracieuse.
 * Entrée : permissionName (string)
 * Sortie : middleware (function) (req, res, next) — 401/403/503 sinon next()
 */
const requirePermission = (permissionName) => async (req, res, next) => {
    if (req.headers["x-internal-secret"] === INTERNAL_SERVICE_SECRET) {
        return next();
    }
    if (!req.user) {
        return res.status(401).json({ error: "Insufficient permissions" });
    }
    try {
        if (!(await userHasPermission(req.user.id, permissionName))) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    } catch (err) {
        return res.status(503).json({ error: "Permission service unavailable" });
    }
};

module.exports = { requirePermission };
