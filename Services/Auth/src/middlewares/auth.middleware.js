const { verifyToken } = require("../utils/jwt.util");

function authenticate(req, res, next) {
    let token = null;

    // 1. Chercher le token dans le cookie 'token'
    if (req.cookies?.token) {
        token = req.cookies.token;
    }

    // 2. Sinon, chercher dans le header Authorization
    if (!token) {
        const authHeader = req.headers["authorization"];
        if (authHeader) {
            token = authHeader.split(" ")[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) throw new Error("Invalid token");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = { authenticate };