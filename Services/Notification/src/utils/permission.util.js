const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://service-auth:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";
const CACHE_TTL_MS = Number(process.env.PERMISSION_CACHE_TTL_MS) || 60000;

const cache = new Map();
const inflight = new Map();

/**
 * Demande à Auth si un utilisateur (via son rôle) possède une permission, avec cache mémoire
 * (TTL) et mutualisation des appels concurrents pour absorber les rafales d'événements.
 * Si Auth est injoignable, sert le cache même expiré quand il existe (dégradation gracieuse), sinon propage l'erreur.
 * Entrée : userId (string), permissionName (string)
 * Sortie : value (boolean)
 */
async function userHasPermission(userId, permissionName) {
    if (userId === undefined || userId === null) return false;

    const key = `${userId}:${permissionName}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    if (inflight.has(key)) return inflight.get(key);

    const promise = (async () => {
        try {
            const url = `${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}/permissions-by-name/${permissionName}`;
            const response = await fetch(url, {
                headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                throw new Error(`Auth permission check failed (${response.status})`);
            }
            const data = await response.json();
            const value = data?.hasPermission === true;
            cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
            return value;
        } catch (err) {
            if (cached) return cached.value;
            throw err;
        }
    })().finally(() => inflight.delete(key));

    inflight.set(key, promise);
    return promise;
}

module.exports = { userHasPermission };
