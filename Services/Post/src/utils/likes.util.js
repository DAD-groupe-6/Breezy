const Like = require("../models/like.model");

/**
 * Dit si un viewer a liké un post donné.
 * Entrée : postId (ObjectId), viewerId (string|null)
 * Sortie : liked (boolean)
 */
async function isLikedBy(postId, viewerId) {
    if (viewerId == null) return false;
    const found = await Like.exists({ post_id: postId, user_id: String(viewerId) });
    return Boolean(found);
}

/**
 * Renvoie, en une seule requête (évite le N+1), les ids de posts likés par le viewer.
 * Entrée : postIds (array d'ObjectId), viewerId (string|null)
 * Sortie : likedIds (Set de string)
 */
async function likedPostIds(postIds, viewerId) {
    if (viewerId == null || postIds.length === 0) return new Set();
    const likes = await Like.find({
        post_id: { $in: postIds },
        user_id: String(viewerId),
    }).select("post_id");
    return new Set(likes.map((like) => String(like.post_id)));
}

module.exports = { isLikedBy, likedPostIds };
