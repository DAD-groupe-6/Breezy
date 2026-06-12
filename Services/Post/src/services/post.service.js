const mongoose = require("mongoose");
const Post = require("../models/post.model");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Crée un post pour un auteur donné (authorId vient du JWT).
async function createPost(authorId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    return Post.create({ authorId, content: content.trim() });
}

// Feed en scroll infini par curseur.
// - sans `before` : les posts les plus récents
// - avec `before` (un _id) : les posts plus anciens que ce curseur
// Renvoie aussi `nextCursor` : l'_id à repasser pour charger le lot suivant.
async function getFeed({ limit, before } = {}) {
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const query = {};
    if (before && mongoose.Types.ObjectId.isValid(before)) {
        query._id = { $lt: before };
    }

    const posts = await Post.find(query).sort({ _id: -1 }).limit(safeLimit);

    const nextCursor =
        posts.length === safeLimit ? posts[posts.length - 1]._id : null;

    return { posts, nextCursor };
}

async function getPostById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Post not found");
    }
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");
    return post;
}

async function updatePost(id, authorId, content) {
    const post = await getPostById(id);
    if (post.authorId !== authorId) throw new Error("Forbidden");
    if (!content || !content.trim()) throw new Error("Content is required");

    post.content = content.trim();
    return post.save();
}

async function deletePost(id, authorId) {
    const post = await getPostById(id);
    if (post.authorId !== authorId) throw new Error("Forbidden");

    await post.deleteOne();
    return { message: "Post deleted" };
}

module.exports = {
    createPost,
    getFeed,
    getPostById,
    updatePost,
    deletePost,
};
