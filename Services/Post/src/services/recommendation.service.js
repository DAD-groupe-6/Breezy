const axios = require("axios");
const Post = require("../models/post.model");
const { toView } = require("../utils/postView");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

async function getRecommendedPosts(userId, { limit } = {}) {
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    try {
        const followingResponse = await axios.get(
            `${USER_SERVICE_URL}/api/v1/user/${userId}/following`,
            { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET }, timeout: 5000 }
        );
        const followingUsers = followingResponse.data.following || [];

        // 1. Posts des comptes suivis (que de vrais posts, pas les commentaires)
        let posts = [];
        if (followingUsers.length > 0) {
            posts = await Post.find({
                type: "post",
                id_user: { $in: followingUsers.map(String) },
            })
                .sort({ createdAt: -1, _id: -1 })
                .limit(safeLimit);
        }

        // 2. Complement avec d'autres comptes si on n'a pas atteint la limite
        if (posts.length < safeLimit) {
            const followedIds = [...followingUsers.map(String), String(userId)];
            const randomPosts = await Post.find({
                type: "post",
                id_user: { $nin: followedIds },
            })
                .sort({ createdAt: -1, _id: -1 })
                .limit(safeLimit - posts.length);
            posts = [...posts, ...randomPosts];
        }

        return { posts: posts.map((post) => toView(post, userId)) };
    } catch (err) {
        // Utilisateur inconnu cote user-service : on renvoie un feed generique
        if (err.response?.status === 404) {
            const posts = await Post.find({
                type: "post",
                id_user: { $nin: [String(userId)] },
            })
                .sort({ createdAt: -1, _id: -1 })
                .limit(safeLimit);
            return { posts: posts.map((post) => toView(post, userId)) };
        }
        throw new Error(`Failed to fetch recommendations: ${err.message}`);
    }
}

module.exports = {
    getRecommendedPosts,
};
