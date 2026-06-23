const PostService = require("../services/post.service");

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

// Posts
async function createPost(req, res) {
    try {
        const { content } = req.body;
        const post = await PostService.createPost(req.user.id, content);
        res.status(201).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function getPost(req, res) {
    try {
        const post = await PostService.getPostView(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function getUserPosts(req, res) {
    try {
        const role = req.user?.role;
        if (role === "utilisateur" && String(req.user.id) !== String(req.params.userId)) {
            return res.status(403).json({ message: "You can only view your own posts" });
        }
        const { page, limit } = req.query;
        // req.params.userId = l'auteur du profil visité ; req.user.id = le viewer connecté.
        // Les deux sont distincts : sinon likedByMe serait calculé pour l'auteur, pas pour moi.
        const result = await PostService.getUserPosts(req.params.userId, req.user.id, { page, limit });
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}


async function deletePost(req, res) {
    try {
        const canModerate = ["moderateur", "administrateur"].includes(req.user?.role);
        const result = await PostService.deletePost(req.params.id, req.user.id, canModerate);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function reportPost(req, res) {
    try {
        const result = await PostService.reportPost(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

// Likes
async function likePost(req, res) {
    try {
        const post = await PostService.likePost(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function unlikePost(req, res) {
    try {
        const post = await PostService.unlikePost(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

// Commentaires
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

async function deleteComment(req, res) {
    try {
        const canModerate = ["moderateur", "administrateur"].includes(req.user?.role);
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

// Un commentaire est un post : on like/unlike directement par son id (commentId).
async function likeComment(req, res) {
    try {
        const comment = await PostService.likePost(req.params.commentId, req.user.id);
        res.status(200).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function unlikeComment(req, res) {
    try {
        const comment = await PostService.unlikePost(req.params.commentId, req.user.id);
        res.status(200).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

// Recherche
async function searchByContent(req, res) {
    try {
        const { keywords, page, limit } = req.query;
        const result = await PostService.searchByContent(keywords, req.user.id, { page, limit });
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function searchByTag(req, res) {
    try {
        const { tag } = req.params;
        const { page, limit } = req.query;
        const result = await PostService.searchByTag(tag, req.user.id, { page, limit });
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

module.exports = {
    createPost,
    getPost,
    getUserPosts,
    deletePost,
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
