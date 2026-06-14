const mongoose = require("mongoose");
const Post = require("../models/post.model");
const { likeStats } = require("../utils/likes.util");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function toView(post, viewerId) {
    return {
        _id: post._id,
        authorId: post.authorId,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: post.comments.length,
        ...likeStats(post.likes, viewerId),
    };
}

function toCommentView(comment, viewerId) {
    return {
        _id: comment._id,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        ...likeStats(comment.likes, viewerId),
    };
}

async function createPost(authorId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const post = await Post.create({ authorId, content: content.trim() });
    return toView(post, authorId);
}

async function getFeed({ limit, before, viewerId } = {}) {
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const query = {};
    if (before && mongoose.Types.ObjectId.isValid(before)) {
        query._id = { $lt: before };
    }

    const posts = await Post.find(query).sort({ _id: -1 }).limit(safeLimit);

    const nextCursor =
        posts.length === safeLimit ? posts[posts.length - 1]._id : null;

    return { posts: posts.map((post) => toView(post, viewerId)), nextCursor };
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

async function updatePost(id, authorId, content) {
    const post = await getPostById(id);
    if (post.authorId !== authorId) throw new Error("Forbidden");
    if (!content || !content.trim()) throw new Error("Content is required");

    post.content = content.trim();
    await post.save();
    return toView(post, authorId);
}

async function deletePost(id, authorId) {
    const post = await getPostById(id);
    if (post.authorId !== authorId) throw new Error("Forbidden");

    await post.deleteOne();
    return { message: "Post deleted" };
}

async function likePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
    );
    if (!post) throw new Error("Post not found");
    return toView(post, userId);
}

async function unlikePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
    );
    if (!post) throw new Error("Post not found");
    return toView(post, userId);
}

async function addComment(postId, authorId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const post = await getPostById(postId);
    post.comments.push({ authorId, content: content.trim() });
    await post.save();
    const created = post.comments[post.comments.length - 1];
    return toCommentView(created, authorId);
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
    if (comment.authorId !== userId) throw new Error("Forbidden");

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
    if (!comment.likes.includes(userId)) comment.likes.push(userId);
    await post.save();
    return toCommentView(comment, userId);
}

async function unlikeComment(postId, commentId, userId) {
    const { post, comment } = await getCommentOrThrow(postId, commentId);
    comment.likes.pull(userId);
    await post.save();
    return toCommentView(comment, userId);
}

module.exports = {
    createPost,
    getFeed,
    getPostById,
    getPostView,
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
