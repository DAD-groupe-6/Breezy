const { verifyToken } = require("../utils/jwt.util");

/**
 * Récupère le token depuis le cookie 'token', sinon le header Authorization.
 * Entrée : req (Request)
 * Sortie : token (string) ou null
 */
function extractToken(req) {
    if (req.cookies?.token) {
        return req.cookies.token;
    }
    const authHeader = req.headers["authorization"];
    if (authHeader) {
        return authHeader.split(" ")[1];
    }
    return null;
}

/**
 * Construit le middleware d'authentification. optional=false bloque en 401 si le token
 * manque ou est invalide ; optional=true pose req.user=null et laisse passer.
 * Entrée : options (object) { optional (boolean) }
 * Sortie : middleware (function) (req, res, next)
 */
function authenticate({ optional = false } = {}) {
    return (req, res, next) => {
        const token = extractToken(req);

        if (!token) {
            if (optional) {
                req.user = null;
                return next();
            }
            return res.status(401).json({ message: "No token provided" });
        }

        try {
            const decoded = verifyToken(token);
            if (!decoded) throw new Error("Invalid token");
            req.user = decoded;
            return next();
        } catch (err) {
            if (optional) {
                req.user = null;
                return next();
            }
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
}

module.exports = { authenticate };
