const PostService = require("../services/post.service");
const { roleHasPermission } = require("../middlewares/permission.middleware");

/**
 * Traduit un message d'erreur métier en code HTTP.
 * Entrée : message (string)
 * Sortie : status (number)
 */
function statusFor(message) {
    switch (message) {
        case "Post not found":
            return 404;
        case "Comment not found":
            return 404;
        case "User not found":
            return 404;
        case "Forbidden":
            return 403;
        case "Failed to report post":
            return 502;
        case "Cannot report your own post":
            return 403;
        case "Already reported":
            return 409;
        default:
            return 400;
    }
}

/**
 * Crée un post.
 * Entrée : req.user.id (string), req.body { content, images, video }
 * Sortie : 201 post (view) ; 4xx via statusFor
 */
async function createPost(req, res) {
    try {
        const { content, images, video } = req.body;
        const post = await PostService.createPost(req.user.id, content, images, video);
        res.status(201).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Renvoie un post avec l'état "liké par moi".
 * Entrée : req.params.id (string), req.user.id (string)
 * Sortie : 200 post (view) ; 4xx via statusFor
 */
async function getPost(req, res) {
    try {
        const post = await PostService.getPostView(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Liste les posts d'un profil ; masque les posts d'autrui sans la permission view_others_posts
 * (mais renvoie tout de même le total).
 * Entrée : req.params.userId (string), req.user (object), req.query { page, limit }
 * Sortie : 200 result { posts, hasMore, total } ; 4xx via statusFor
 */
async function getUserPosts(req, res) {
    try {
        const isOwnProfile = String(req.user?.id) === String(req.params.userId);
        if (!isOwnProfile && !(await roleHasPermission(req.user?.roleId, "view_others_posts"))) {
            const total = await PostService.countUserPosts(req.params.userId);
            return res.status(200).json({ posts: [], hasMore: false, total });
        }
        const { page, limit } = req.query;
        const result = await PostService.getUserPosts(req.params.userId, req.user.id, { page, limit });
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}


/**
 * Supprime un post (auteur, ou modérateur via moderate_users).
 * Entrée : req.params.id (string), req.user (object)
 * Sortie : 200 result { message } ; 4xx via statusFor
 */
async function deletePost(req, res) {
    try {
        const canModerate = await roleHasPermission(req.user?.roleId, "moderate_users");
        const result = await PostService.deletePost(req.params.id, req.user.id, canModerate);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Édite le contenu d'un post (auteur seul).
 * Entrée : req.params.id (string), req.user.id (string), req.body.content (string)
 * Sortie : 200 post (view) ; 4xx via statusFor
 */
async function editPost(req, res) {
    try {
        const post = await PostService.editPost(req.params.id, req.user.id, req.body.content);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Signale un post (suppression auto au 3e signalement).
 * Entrée : req.params.id (string), req.user.id (string)
 * Sortie : 200 result { message, deleted, reports } ; 4xx via statusFor
 */
async function reportPost(req, res) {
    try {
        const result = await PostService.reportPost(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Like un post.
 * Entrée : req.params.id (string), req.user.id (string)
 * Sortie : 200 post (view) ; 4xx via statusFor
 */
async function likePost(req, res) {
    try {
        const post = await PostService.likePost(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Retire le like d'un post.
 * Entrée : req.params.id (string), req.user.id (string)
 * Sortie : 200 post (view) ; 4xx via statusFor
 */
async function unlikePost(req, res) {
    try {
        const post = await PostService.unlikePost(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Ajoute un commentaire (ou une réponse) à un post.
 * Entrée : req.params.id (string), req.user.id (string), req.body.content (string)
 * Sortie : 201 comment (view + reply_to_user) ; 4xx via statusFor
 */
async function addComment(req, res) {
    try {
        const { content } = req.body;
        const comment = await PostService.addComment(
            req.params.id,
            req.user.id,
            content
        );
        res.status(201).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Liste les commentaires d'un post (paginés, triables).
 * Entrée : req.params.id (string), req.user.id (string), req.query { page, limit, order }
 * Sortie : 200 result { comments, hasMore } ; 4xx via statusFor
 */
async function listComments(req, res) {
    try {
        const { page, limit, order } = req.query;
        const comments = await PostService.listComments(req.params.id, req.user.id, {
            page,
            limit,
            order,
        });
        res.status(200).json(comments);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Supprime un commentaire (auteur, ou modérateur via moderate_users).
 * Entrée : req.params { id, commentId }, req.user (object)
 * Sortie : 200 result { message } ; 4xx via statusFor
 */
async function deleteComment(req, res) {
    try {
        const canModerate = await roleHasPermission(req.user?.roleId, "moderate_users");
        const result = await PostService.deleteComment(
            req.params.id,
            req.params.commentId,
            req.user.id,
            canModerate
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Like un commentaire (un commentaire est un post, on cible son commentId).
 * Entrée : req.params.commentId (string), req.user.id (string)
 * Sortie : 200 comment (view) ; 4xx via statusFor
 */
async function likeComment(req, res) {
    try {
        const comment = await PostService.likePost(req.params.commentId, req.user.id);
        res.status(200).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Retire le like d'un commentaire.
 * Entrée : req.params.commentId (string), req.user.id (string)
 * Sortie : 200 comment (view) ; 4xx via statusFor
 */
async function unlikeComment(req, res) {
    try {
        const comment = await PostService.unlikePost(req.params.commentId, req.user.id);
        res.status(200).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Exécute une recherche (par tag ou par contenu) et renvoie les posts.
 * Entrée : req (Request), res (Response), type (string "tag"|"content"), value (string)
 * Sortie : 200 result { posts, hasMore } ; 4xx via statusFor
 */
async function executeSearch(req, res, type, value) {
    try {
        const { page, limit } = req.query;
        const result = type === "tag"
            ? await PostService.searchByTag(value, req.user.id, { page, limit })
            : await PostService.searchByContent(value, req.user.id, { page, limit });
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Recherche des posts par mots-clés.
 * Entrée : req.query.keywords (string)
 * Sortie : 200 result { posts, hasMore }
 */
async function searchByContent(req, res) {
    const { keywords } = req.query;
    return executeSearch(req, res, "content", keywords);
}

/**
 * Recherche des posts par tag.
 * Entrée : req.params.tag (string)
 * Sortie : 200 result { posts, hasMore }
 */
async function searchByTag(req, res) {
    const { tag } = req.params;
    return executeSearch(req, res, "tag", tag);
}

module.exports = {
    createPost,
    getPost,
    getUserPosts,
    deletePost,
    editPost,
    reportPost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
    likeComment,
    unlikeComment,
    searchByContent,
    searchByTag,
};
