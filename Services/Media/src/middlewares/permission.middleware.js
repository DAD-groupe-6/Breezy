const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://service-auth:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";
// Durée de vie du cache des permissions d'un rôle (ms). Les rôles/permissions changent rarement,
// donc on évite d'appeler Auth à chaque requête. Re-seed = attendre l'expiration (ou redémarrer).
const CACHE_TTL_MS = Number(process.env.PERMISSION_CACHE_TTL_MS) || 60000;

// Cache mémoire : roleId -> { permissions: string[], expiresAt: number }
const cache = new Map();
// Appels en cours : roleId -> Promise, pour mutualiser les requêtes concurrentes (anti-thundering-herd).
const inflight = new Map();

// Récupère (et met en cache) la liste des permissions d'un rôle depuis Auth (source unique de vérité).
// Un seul appel par rôle et par fenêtre de TTL, au lieu d'un appel par permission et par requête.
// Voir Auth : GET /api/v1/auth/roles/:roleId/permissions
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

// Vérifie si un rôle possède une permission, à partir de la liste mise en cache.
async function roleHasPermission(roleId, permissionName) {
    if (roleId === undefined || roleId === null) return false;
    const permissions = await getRolePermissions(roleId);
    return permissions.includes(permissionName);
}

// Vérifie une permission via le rôle de l'utilisateur, en déléguant au service Auth.
const requirePermission = (permissionName) => async (req, res, next) => {
    // Appels internes service-à-service : on court-circuite la vérification.
    if (req.headers["x-internal-secret"] === INTERNAL_SERVICE_SECRET) {
        return next();
    }
    // Non authentifié (rôle "visiteur") : aucune route de ce service ne lui est ouverte.
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
