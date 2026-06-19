const AuthService = require("../services/auth.service");

async function register(req, res) {
    try {
        const { email, password, pseudo_uniq, pseudo } = req.body;
        const result = await AuthService.register(email, password, pseudo_uniq, pseudo);
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
        const status = err.message === "Account is banned" ? 403 : 401;
        res.status(status).json({ message: err.message });
    }
}

function logout(req, res) {
    // Le cookie breezy-auth est géré côté frontend avec clearToken()
    res.status(200).json({ message: "Logged out" });
}

async function validate(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        await AuthService.assertUserNotBanned(req.user.id);
    } catch (err) {
        const status = err.message === "Account is banned" ? 403 : 401;
        return res.status(status).json({ message: err.message });
    }

    return res.status(200).json({ message: "Token is valid" });
}

module.exports = { register, login, logout, validate };