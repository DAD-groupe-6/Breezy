const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";

/**
 * Vérifie la signature et la validité d'un JWT (même JWT_SECRET que le service Auth).
 * Entrée : token (string)
 * Sortie : decoded (object) si valide, null sinon
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = { verifyToken };
