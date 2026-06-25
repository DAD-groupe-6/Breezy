const UserService = require("../services/user.service");

/**
 * Crée un profil (appel interne depuis Auth lors de l'inscription).
 * Entrée : req.body { id_user, pseudo_uniq, pseudo }
 * Sortie : 201 result (profil) ; 400 si erreur
 */
async function createUser(req, res) {
    try {
        const { id_user, pseudo_uniq, pseudo } = req.body;
        const result = await UserService.createUser(id_user, pseudo_uniq, pseudo);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

/**
 * Renvoie un profil par son id.
 * Entrée : req.params.id (string)
 * Sortie : 200 result (profil) ; 404 si introuvable
 */
async function getUser(req, res) {
    try {
        const result = await UserService.getUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

/**
 * Met à jour un profil (pseudo, bio, photo).
 * Entrée : req.params.id (string), req.body { pseudo?, bio?, img_profile? }
 * Sortie : 200 result (profil) ; 400 si erreur
 */
async function updateUser(req, res) {
    try {
        const result = await UserService.updateUser(req.params.id, req.body);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

/**
 * Supprime un profil.
 * Entrée : req.params.id (string)
 * Sortie : 200 result { id_user } ; 404 si introuvable
 */
async function deleteUser(req, res) {
    try {
        const result = await UserService.deleteUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

/**
 * Signale un utilisateur (bannissement automatique au 3e signalement).
 * Entrée : req.params.id (string)
 * Sortie : 200 result { id_user, deleted_reported_posts, banned_until, is_banned } ; 404 si introuvable
 */
async function reportUser(req, res) {
    try {
        const result = await UserService.reportUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

/**
 * Renvoie des suggestions de profils à suivre.
 * Entrée : req.query { userId, limit }
 * Sortie : 200 result (array de profils) ; 500 si erreur
 */
async function getSuggestions(req, res) {
    try {
        const { userId, limit } = req.query;
        const result = await UserService.getSuggestions(userId, limit);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * Recherche des profils par pseudo unique (partiel).
 * Entrée : req.query.pseudo_uniq (string)
 * Sortie : 200 result (array de profils) ; 400 si paramètre manquant, 500 si erreur
 */
async function searchUsersByPseudo(req, res) {
    try {
        const { pseudo_uniq } = req.query;
        if (!pseudo_uniq) {
            return res.status(400).json({ message: "pseudo_uniq parameter is required" });
        }
        const result = await UserService.searchUsersByPseudo(pseudo_uniq);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * Bannit un utilisateur (durée en jours, ou permanent si null).
 * Entrée : req.params.id (string), req.body.durationDays (number|null)
 * Sortie : 200 result { id_user, banned_until } ; 404 si introuvable
 */
async function banUser(req, res) {
    try {
        const { durationDays } = req.body;
        const result = await UserService.banUser(req.params.id, durationDays ?? null);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

/**
 * Lève le bannissement d'un utilisateur.
 * Entrée : req.params.id (string)
 * Sortie : 200 result { id_user, banned_until: null } ; 404 si introuvable
 */
async function unbanUser(req, res) {
    try {
        const result = await UserService.unbanUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    reportUser,
    banUser,
    unbanUser,
    searchUsersByPseudo,
    getSuggestions,
};
