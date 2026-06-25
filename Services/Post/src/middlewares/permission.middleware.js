const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://service-auth:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";
const CACHE_TTL_MS = Number(process.env.PERMISSION_CACHE_TTL_MS) || 60000;

const cache = new Map();
const inflight = new Map();

/**
 * Récupère les permissions d'un rôle depuis Auth, avec cache mémoire (TTL) et mutualisation
 * des appels concurrents pour ne pas marteler Auth.
 * Entrée : roleId (number)
 * Sortie : permissions (array de string)
 */
async function getRolePermissions(roleId) {
    const cached = cache.get(roleId);
    if (cached && cached.expiresAt > Date.now()) return cached.permissions;

    if (inflight.has(roleId)) return inflight.get(roleId);

    const promise = (async () => {
        try {
            const url = `${AUTH_SERVICE_URL}/api/v1/auth/roles/${roleId}/permissions`;
            const response = await fetch(url, {
                headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                throw new Error(`Auth permission check failed (${response.status})`);
            }
            const data = await response.json();
            const permissions = Array.isArray(data?.permissions) ? data.permissions : [];
            cache.set(roleId, { permissions, expiresAt: Date.now() + CACHE_TTL_MS });
            return permissions;
        } catch (err) {
            // Dégradation gracieuse : si Auth est injoignable mais qu'on a déjà un cache
            // (même expiré), on le sert plutôt que de bloquer toutes les routes en 503.
            if (cached) return cached.permissions;
            throw err;
        }
    })().finally(() => inflight.delete(roleId));

    inflight.set(roleId, promise);
    return promise;
}

/**
 * Dit si un rôle possède une permission donnée.
 * Entrée : roleId (number), permissionName (string)
 * Sortie : hasPermission (boolean)
 */
async function roleHasPermission(roleId, permissionName) {
    if (roleId === undefined || roleId === null) return false;
    const permissions = await getRolePermissions(roleId);
    return permissions.includes(permissionName);
}

/**
 * Construit un middleware exigeant une permission (les appels internes x-internal-secret passent).
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
        if (!(await roleHasPermission(req.user.roleId, permissionName))) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    } catch (err) {
        return res.status(503).json({ error: "Permission service unavailable" });
    }
};

module.exports = { requirePermission, roleHasPermission };
