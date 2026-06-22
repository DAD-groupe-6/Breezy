const Like = require("../models/like.model");

// Un post : ce viewer l'a-t-il liké ?
async function isLikedBy(postId, viewerId) {
    if (viewerId == null) return false;
    const found = await Like.exists({ post_id: postId, user_id: String(viewerId) });
    return Boolean(found);
}

// Une liste de posts : les ids likés par le viewer, en une requête (évite le N+1).
async function likedPostIds(postIds, viewerId) {
    if (viewerId == null || postIds.length === 0) return new Set();
    const likes = await Like.find({
        post_id: { $in: postIds },
        user_id: String(viewerId),
    }).select("post_id");
    return new Set(likes.map((like) => String(like.post_id)));
}

module.exports = { isLikedBy, likedPostIds };
