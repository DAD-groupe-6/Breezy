const { verifyToken } = require("../utils/jwt.util");

// Récupère le token depuis le cookie 'token' ou, à défaut, le header Authorization.
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

// Middleware d'authentification unifié.
// - optional:false (défaut) : bloque avec 401 si le token est absent ou invalide.
// - optional:true           : met req.user = null et laisse passer (la permission décide ensuite).
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
