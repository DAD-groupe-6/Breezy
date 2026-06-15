function likeStats(likesArray, viewerId) {
    const likes = likesArray || [];
    return {
        nb_like: likes.length,
        likedByMe: viewerId != null && likes.includes(String(viewerId)),
    };
}

module.exports = { likeStats };
