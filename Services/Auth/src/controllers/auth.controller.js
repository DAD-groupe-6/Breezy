const AuthService = require("../services/auth.service");

async function register(req, res) {
    try {
        const { email, password, username, displayName } = req.body;
        const result = await AuthService.register(email, password, username, displayName);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);

        // Le frontend va créer le cookie breezy-auth
        // On retourne juste le token en JSON
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

function logout(req, res) {
    // Le cookie breezy-auth est géré côté frontend avec clearToken()
    res.status(200).json({ message: "Logged out" });
}

function validate(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ message: "Token is valid" });
}

module.exports = { register, login, logout, validate };