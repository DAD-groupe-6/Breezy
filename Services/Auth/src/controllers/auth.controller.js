const AuthService = require("../services/auth.service");

/**
 * Crée un compte (et son profil côté User).
 * Entrée : req.body { email, password, pseudo_uniq, pseudo, roleId? }
 * Sortie : 201 result { id, email, roleId } ; 403 si non autorisé, 400 sinon
 */
async function register(req, res) {
    try {
        const { email, password, pseudo_uniq, pseudo, roleId } = req.body;
        const result = await AuthService.register(email, password, pseudo_uniq, pseudo, roleId, req.user);
        res.status(201).json(result);
    } catch (err) {
        const status = err.message === "Forbidden" ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
}

/**
 * Authentifie l'utilisateur et renvoie un JWT (le cookie est posé côté front).
 * Entrée : req.body { email, password }
 * Sortie : 200 result { token } ; 403 si banni, 401 si identifiants invalides
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.status(200).json(result);
    } catch (err) {
        const status = err.message === "Account is banned" ? 403 : 401;
        res.status(status).json({ message: err.message });
    }
}

/**
 * Déconnexion (le cookie est effacé côté front).
 * Entrée : rien
 * Sortie : 200 { message }
 */
function logout(req, res) {
    res.status(200).json({ message: "Logged out" });
}

/**
 * Valide le token et vérifie que le compte n'est pas banni (utilisé par la gateway).
 * Entrée : req.user (object) posé par le middleware authenticate
 * Sortie : 200 { message } ; 401 si non authentifié, 403 si banni
 */
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

/**
 * Supprime le compte courant (et son profil côté User).
 * Entrée : req.user.id (number)
 * Sortie : 200 result { id } ; 404 si introuvable, 400 sinon
 */
async function deleteAccount(req, res) {
    try {
        const result = await AuthService.deleteAccount(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        const status = err.message === "User not found" ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
}

module.exports = { register, login, logout, validate, deleteAccount };