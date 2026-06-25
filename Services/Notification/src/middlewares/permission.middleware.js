const { userHasPermission } = require("../utils/permission.util");

const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

// Vérifie une permission via le rôle de l'utilisateur, en déléguant au service Auth.
// Réutilise userHasPermission (permission.util) qui gère déjà cache + dégradation gracieuse.
const requirePermission = (permissionName) => async (req, res, next) => {
    // Appels internes service-à-service : on court-circuite la vérification.
    if (req.headers["x-internal-secret"] === INTERNAL_SERVICE_SECRET) {
        return next();
    }
    // Non authentifié : aucune route de ce service ne lui est ouverte.
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
