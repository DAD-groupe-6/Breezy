const RecommendationService = require("../services/recommendation.service");

/**
 * Renvoie le fil recommandé d'un utilisateur (posts des comptes suivis + complément).
 * Entrée : req.user.id (string), req.query { limit, page }
 * Sortie : 200 result { posts, hasMore } ; 400 si erreur
 */
async function getRecommendedPosts(req, res) {
    try {
        const { limit, page } = req.query;
        const result = await RecommendationService.getRecommendedPosts(req.user.id, {
            limit,
            page,
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = {
    getRecommendedPosts,
};
