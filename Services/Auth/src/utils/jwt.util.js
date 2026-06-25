const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

/**
 * Signe un JWT à partir des données fournies.
 * Entrée : payload (object), ex. { id, roleId, role }
 * Sortie : token (string)
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Vérifie la signature et la validité d'un JWT.
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

/**
 * Décode un JWT sans vérifier sa signature.
 * Entrée : token (string)
 * Sortie : decoded (object) ou null
 */
function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = { generateToken, verifyToken, decodeToken };