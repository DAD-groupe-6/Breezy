const PostService = require("../services/post.service");

function statusFor(message) {
    switch (message) {
        case "Post not found":
            return 404;
        case "Comment not found":
            return 404;
        case "Forbidden":
            return 403;
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

async function updatePost(req, res) {
    try {
        const { content } = req.body;
        const post = await PostService.updatePost(
            req.params.id,
            req.user.id,
            content
        );
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function deletePost(req, res) {
    try {
        const result = await PostService.deletePost(req.params.id, req.user.id);
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
        const comments = await PostService.listComments(req.params.id, req.user.id);
        res.status(200).json(comments);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function deleteComment(req, res) {
    try {
        const result = await PostService.deleteComment(
            req.params.id,
            req.params.commentId,
            req.user.id
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

module.exports = {
    createPost,
    getPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
    likeComment,
    unlikeComment,
};
