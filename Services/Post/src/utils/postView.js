// Transforme un document Post (post ou commentaire) en objet exposé par l'API.
function toView(post, likedByMe = false) {
    return {
        _id: post._id,
        id_user: post.id_user,
        content: post.content,
        images: post.images || [],
        video: post.video || null,
        type: post.type,
        parent_id: post.parent_id,
        reply_to: post.reply_to,
        list_tags: post.list_tags,
        nb_signalement: post.nb_signalement,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: post.commentsCount,
        nb_like: post.nb_like,
        edited: post.edited || false,
        likedByMe,
    };
}

module.exports = { toView };
