const PostService = require("../services/post.service");

// Traduit un message d'erreur métier en code HTTP.
function statusFor(message) {
    switch (message) {
        case "Post not found":
            return 404;
        case "Forbidden":
            return 403;
        default:
            return 400;
    }
}

async function createPost(req, res) {
    try {
        const { content } = req.body;
        const post = await PostService.createPost(req.user.id, content);
        res.status(201).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function getFeed(req, res) {
    try {
        const { limit, before } = req.query;
        const result = await PostService.getFeed({ limit, before });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getPost(req, res) {
    try {
        const post = await PostService.getPostById(req.params.id);
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

module.exports = { createPost, getFeed, getPost, updatePost, deletePost };
