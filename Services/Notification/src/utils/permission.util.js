const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://service-auth:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";
// Durée de vie du cache (ms). Les permissions changent rarement : on évite d'appeler Auth
// à chaque évènement, surtout lors de rafales (ex. multiples likes vers le même destinataire).
const CACHE_TTL_MS = Number(process.env.PERMISSION_CACHE_TTL_MS) || 60000;

// Cache mémoire : "userId:permissionName" -> { value: boolean, expiresAt: number }
const cache = new Map();
// Appels en cours, même clé, pour mutualiser les requêtes concurrentes.
const inflight = new Map();

// Demande au service Auth (source unique de vérité) si l'utilisateur — via son rôle —
// possède la permission. On part d'un userId car le consumer ne connaît que le destinataire.
// Voir Auth : GET /api/v1/auth/users/:userId/permissions-by-name/:permissionName
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
            // Dégradation gracieuse : Auth injoignable mais cache présent (même expiré) → on le sert.
            if (cached) return cached.value;
            throw err;
        }
    })().finally(() => inflight.delete(key));

    inflight.set(key, promise);
    return promise;
}

module.exports = { userHasPermission };
