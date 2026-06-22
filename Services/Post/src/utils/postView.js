// Transforme un document Post (post OU commentaire) en objet exposé par l'API.
// Un commentaire est un post de type "response" : il utilise donc la même vue.
//
// `likedByMe` est désormais FOURNI par le service (calculé via la collection Like),
// au lieu d'être déduit d'un tableau embarqué. `nb_like` est lu directement sur
// le document (compteur dénormalisé, tenu à jour à chaque like/unlike).
function toView(post, likedByMe = false) {
    return {
        _id: post._id,
        id_user: post.id_user,
        content: post.content,
        image: post.image,
        type: post.type,
        parent_id: post.parent_id,
        reply_to: post.reply_to,
        list_tags: post.list_tags,
        nb_signalement: post.nb_signalement,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: post.commentsCount,
        nb_like: post.nb_like,
        likedByMe,
    };
}

module.exports = { toView };
