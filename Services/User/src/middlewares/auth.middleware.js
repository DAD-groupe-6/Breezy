const { verifyToken } = require("../utils/jwt.util");

function optionalAuthenticate(req, res, next) {
    let token = null;

    if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        const authHeader = req.headers["authorization"];
        if (authHeader) {
            token = authHeader.split(" ")[1];
        }
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded || null;
    } catch {
        req.user = null;
    }

    next();
}

module.exports = { optionalAuthenticate };
