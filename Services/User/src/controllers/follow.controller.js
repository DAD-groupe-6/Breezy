const FollowService = require("../services/follow.service");

/**
 * Crée une relation de suivi.
 * Entrée : req.body { follower_id, following_id }
 * Sortie : 201 result { message, follow } ; 400 si paramètre manquant ou erreur métier
 */
async function addFollow(req, res) {
    try {
        const { follower_id, following_id } = req.body;

        if (!follower_id || !following_id) {
            return res.status(400).json({ message: "follower_id and following_id are required" });
        }

        const result = await FollowService.addFollow(follower_id, following_id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

/**
 * Supprime une relation de suivi.
 * Entrée : req.body { follower_id, following_id }
 * Sortie : 200 result { message } ; 400 si paramètre manquant ou erreur métier
 */
async function removeFollow(req, res) {
    try {
        const { follower_id, following_id } = req.body;

        if (!follower_id || !following_id) {
            return res.status(400).json({ message: "follower_id and following_id are required" });
        }

        const result = await FollowService.removeFollow(follower_id, following_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

/**
 * Liste les abonnés d'un utilisateur.
 * Entrée : req.params.id (string)
 * Sortie : 200 result { user_id, followers_count, followers_list } ; 404 si introuvable
 */
async function getFollowers(req, res) {
    try {
        const { id } = req.params;
        const result = await FollowService.getFollowers(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

/**
 * Liste les abonnements d'un utilisateur.
 * Entrée : req.params.id (string)
 * Sortie : 200 result { following } ; 404 si introuvable
 */
async function getFollowing(req, res) {
    try {
        const { id } = req.params;
        const result = await FollowService.getFollowing(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = { addFollow, removeFollow, getFollowers, getFollowing };
