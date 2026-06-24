const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://service-auth:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

// Interroge le service Auth (source unique de vérité) pour savoir si un rôle possède une permission.
// Voir Auth : GET /api/v1/auth/roles/:roleId/permissions-by-name/:permissionName
async function roleHasPermission(roleId, permissionName) {
    if (roleId === undefined || roleId === null) return false;

    const url = `${AUTH_SERVICE_URL}/api/v1/auth/roles/${roleId}/permissions-by-name/${permissionName}`;
    const response = await fetch(url, {
        headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
        signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
        throw new Error(`Auth permission check failed (${response.status})`);
    }
    const data = await response.json();
    return data?.hasPermission === true;
}

// Vérifie une permission via le rôle de l'utilisateur, en déléguant au service Auth.
const requirePermission = (permissionName) => async (req, res, next) => {
    if (req.headers["x-internal-secret"] === INTERNAL_SERVICE_SECRET) {
        return next();
    }
    if (!req.user) {
        return res.status(401).json({ error: "Insufficient permissions" });
    }
    try {
        if (!(await roleHasPermission(req.user.roleId, permissionName))) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    } catch (err) {
        return res.status(503).json({ error: "Permission service unavailable" });
    }
};

module.exports = { requirePermission, roleHasPermission };
