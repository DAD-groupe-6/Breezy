const mongoose = require("mongoose");
const Post = require("../models/post.model");
const { toView } = require("../utils/postView");
const { extractTags } = require("../utils/tags.util");

// Posts
async function createPost(userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const trimmed = content.trim();
    const post = await Post.create({
        id_user: String(userId),
        content: trimmed,
        list_tags: extractTags(trimmed),
    });
    return toView(post, userId);
}

async function getPostById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Post not found");
    }
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");
    return post;
}

async function getPostView(id, viewerId) {
    const post = await getPostById(id);
    return toView(post, viewerId);
}

async function deletePost(id, userId) {
    const post = await getPostById(id);
    if (post.id_user !== String(userId)) throw new Error("Forbidden");

    await post.deleteOne();
    return { message: "Post deleted" };
}

// Likes
async function likePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likes: String(userId) } },
        { new: true }
    );
    if (!post) throw new Error("Post not found");
    return toView(post, userId);
}

async function unlikePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: String(userId) } },
        { new: true }
    );
    if (!post) throw new Error("Post not found");
    return toView(post, userId);
}

// Commentaires (posts de type "response")
async function addComment(parentId, userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    await getPostById(parentId); // 404 si le post parent n'existe pas
    const trimmed = content.trim();
    const comment = await Post.create({
        id_user: String(userId),
        content: trimmed,
        type: "response",
        parent_id: parentId,
        list_tags: extractTags(trimmed),
    });
    await Post.findByIdAndUpdate(parentId, { $inc: { commentsCount: 1 } });
    return toView(comment, userId);
}

async function listComments(parentId, viewerId) {
    await getPostById(parentId); // 404 si le post n'existe pas
    const comments = await Post.find({ parent_id: parentId, type: "response" }).sort({
        createdAt: -1,
    });
    return comments.map((comment) => toView(comment, viewerId));
}

async function deleteComment(parentId, commentId, userId) {
    const comment = await getPostById(commentId);
    if (comment.id_user !== String(userId)) throw new Error("Forbidden");

    await comment.deleteOne();
    await Post.findByIdAndUpdate(parentId, { $inc: { commentsCount: -1 } });
    return { message: "Comment deleted" };
}

module.exports = {
    createPost,
    getPostById,
    getPostView,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
};
