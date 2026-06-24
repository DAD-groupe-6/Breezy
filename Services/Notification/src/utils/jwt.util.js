const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";

// Vérifie uniquement le token émis par le service Auth (même JWT_SECRET partagé).
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = { verifyToken };
