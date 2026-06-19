const { likeStats } = require("./likes.util");

// Transforme un document Post (post OU commentaire) en objet exposé par l'API.
// Un commentaire est un post de type "response" : il utilise donc la même vue.
function toView(post, viewerId) {
    return {
        _id: post._id,
        id_user: post.id_user,
        content: post.content,
        image: post.image,
        type: post.type,
        parent_id: post.parent_id,
        list_tags: post.list_tags,
        nb_signalement: post.nb_signalement,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: post.commentsCount,
        ...likeStats(post.likes, viewerId),
    };
}

module.exports = { toView };
