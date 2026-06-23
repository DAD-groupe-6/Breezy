const axios = require("axios");
const Post = require("../models/post.model");
const { toView } = require("../utils/postView");
const { parsePage, slicePage } = require("../utils/pagination.util");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

async function getRecommendedPosts(userId, { limit, page } = {}) {
    const { safeLimit, skip } = parsePage({ limit, page }, DEFAULT_LIMIT, MAX_LIMIT);

    const followingResponse = await axios.get(
        `${USER_SERVICE_URL}/api/v1/user/${userId}/following`,
        { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET }, timeout: 5000 }
    );
    const followingUsers = followingResponse.data.following || [];
    const followedUserIds = followingUsers.map(String);
    const excludedIds = [...followedUserIds, String(userId)];

    // Nombre total de posts des comptes suivis (nécessaire pour calculer le skip du complément)
    const followedCount = followedUserIds.length > 0
        ? await Post.countDocuments({ type: "post", id_user: { $in: followedUserIds } })
        : 0;

    let posts = [];

    // 1. Posts des comptes suivis (paginés)
    if (followedUserIds.length > 0 && skip < followedCount) {
        posts = await Post.find({ type: "post", id_user: { $in: followedUserIds } })
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(safeLimit + 1);
    }

    // 2. Complément avec d'autres posts si la page n'est pas pleine
    if (posts.length <= safeLimit) {
        const followedOnPage = Math.min(posts.length, safeLimit);
        const complementSkip = Math.max(0, skip - followedCount);
        const complementLimit = safeLimit - followedOnPage + 1;

        const complement = await Post.find({ type: "post", id_user: { $nin: excludedIds } })
            .sort({ createdAt: -1, _id: -1 })
            .skip(complementSkip)
            .limit(complementLimit);

        posts = [...posts.slice(0, safeLimit), ...complement];
    }

    const { items, hasMore } = slicePage(posts, safeLimit);
    return { posts: items.map((post) => toView(post, userId)), hasMore };
}

module.exports = {
    getRecommendedPosts,
};
