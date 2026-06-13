function likeStats(likesArray, viewerId) {
    const likes = likesArray || [];
    return {
        likesCount: likes.length,
        likedByMe: viewerId != null && likes.includes(viewerId),
    };
}

module.exports = { likeStats };
