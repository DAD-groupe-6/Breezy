const axios = require("axios");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const { likeStats } = require("../utils/likes.util");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

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
        commentsCount: post.comments.length,
        ...likeStats(post.likes, viewerId),
    };
}

function toCommentView(comment, viewerId) {
    return {
        _id: comment._id,
        id_user: comment.id_user,
        content: comment.content,
        createdAt: comment.createdAt,
        ...likeStats(comment.likes, viewerId),
    };
}

async function createPost(userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const post = await Post.create({ id_user: String(userId), content: content.trim() });
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

async function updatePost(id, userId, content) {
    const post = await getPostById(id);
    if (post.id_user !== String(userId)) throw new Error("Forbidden");
    if (!content || !content.trim()) throw new Error("Content is required");

    post.content = content.trim();
    await post.save();
    return toView(post, userId);
}

async function deletePost(id, userId) {
    const post = await getPostById(id);
    if (post.id_user !== String(userId)) throw new Error("Forbidden");

    await post.deleteOne();
    return { message: "Post deleted" };
}

async function reportPost(id, reporterId) {
    const post = await getPostById(id);

    if (post.id_user === String(reporterId)) {
        throw new Error("Cannot report your own post");
    }

    if (post.reporters.includes(String(reporterId))) {
        throw new Error("Already reported");
    }

    post.reporters.push(String(reporterId));
    post.nb_signalement += 1;
    await post.save();

    if (post.nb_signalement < 3) {
        return {
            message: "Post reported",
            deleted: false,
            reports: post.nb_signalement,
        };
    }

    try {
        await axios.post(
            `${USER_SERVICE_URL}/api/v1/user/${post.id_user}/report`,
            { reportedBy: String(reporterId) },
            { timeout: 5000 }
        );
    } catch (err) {
        if (err.response?.status === 404) {
            throw new Error("User not found");
        }
        throw new Error("Failed to report post");
    }

    await post.deleteOne();
    return {
        message: "Post reported and deleted",
        deleted: true,
        reports: post.nb_signalement,
    };
}

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

async function addComment(postId, userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const post = await getPostById(postId);
    post.comments.push({ id_user: String(userId), content: content.trim() });
    await post.save();
    const created = post.comments[post.comments.length - 1];
    return toCommentView(created, userId);
}

async function listComments(postId, viewerId) {
    const post = await getPostById(postId);
    return [...post.comments]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((comment) => toCommentView(comment, viewerId));
}

async function deleteComment(postId, commentId, userId) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new Error("Comment not found");
    }
    const post = await getPostById(postId);
    const comment = post.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.id_user !== String(userId)) throw new Error("Forbidden");

    post.comments.pull(commentId);
    await post.save();
    return { message: "Comment deleted" };
}

async function getCommentOrThrow(postId, commentId) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new Error("Comment not found");
    }
    const post = await getPostById(postId);
    const comment = post.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");
    return { post, comment };
}

async function likeComment(postId, commentId, userId) {
    const { post, comment } = await getCommentOrThrow(postId, commentId);
    if (!comment.likes.includes(String(userId))) comment.likes.push(String(userId));
    await post.save();
    return toCommentView(comment, userId);
}

async function unlikeComment(postId, commentId, userId) {
    const { post, comment } = await getCommentOrThrow(postId, commentId);
    comment.likes.pull(String(userId));
    await post.save();
    return toCommentView(comment, userId);
}

module.exports = {
    createPost,
    getPostById,
    getPostView,
    updatePost,
    deletePost,
    reportPost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
    likeComment,
    unlikeComment,
};
