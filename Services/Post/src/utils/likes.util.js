const Like = require("../models/like.model");

// Avant, on lisait le tableau `likes` embarqué dans le post (gratuit mais limité).
// Maintenant les likes sont dans une collection séparée : il faut aller les
// chercher. Ces deux helpers encapsulent ces requêtes.

// UN post : est-ce que ce viewer l'a liké ?
// `exists` renvoie juste { _id } ou null → plus léger qu'un find complet.
async function isLikedBy(postId, viewerId) {
    if (viewerId == null) return false;
    const found = await Like.exists({ post_id: postId, user_id: String(viewerId) });
    return Boolean(found);
}

// UNE LISTE de posts : renvoie l'ensemble (Set) des ids likés par le viewer.
// Point clé : UNE seule requête pour toute la page (évite le problème N+1).
// On testera ensuite likedSet.has(String(post._id)) pour chaque post.
async function likedPostIds(postIds, viewerId) {
    if (viewerId == null || postIds.length === 0) return new Set();
    const likes = await Like.find({
        post_id: { $in: postIds },
        user_id: String(viewerId),
    }).select("post_id");
    return new Set(likes.map((like) => String(like.post_id)));
}

module.exports = { isLikedBy, likedPostIds };
