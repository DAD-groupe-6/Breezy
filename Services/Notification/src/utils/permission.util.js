const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://service-auth:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

// Demande au service Auth (source unique de vérité) si l'utilisateur — via son rôle —
// possède la permission. On part d'un userId car le consumer ne connaît que le destinataire.
// Voir Auth : GET /api/v1/auth/users/:userId/permissions-by-name/:permissionName
async function userHasPermission(userId, permissionName) {
    if (userId === undefined || userId === null) return false;

    const url = `${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}/permissions-by-name/${permissionName}`;
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

module.exports = { userHasPermission };
