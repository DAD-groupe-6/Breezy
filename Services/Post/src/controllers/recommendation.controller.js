const RecommendationService = require("../services/recommendation.service");

async function getRecommendedPosts(req, res) {
    try {
        const { limit } = req.query;
        const result = await RecommendationService.getRecommendedPosts(req.user.id, {
            limit,
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = {
    getRecommendedPosts,
};
