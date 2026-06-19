const axios = require("axios");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const { toView } = require("../utils/postView");
const { extractTags } = require("../utils/tags.util");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

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

// Recherche
async function searchByContent(keywords, viewerId) {
    if (!keywords || !keywords.trim()) {
        throw new Error("Keywords are required");
    }
    // Créer une regex pour chercher les mots-clés (insensible à la casse)
    const regex = new RegExp(keywords, "i");
    const posts = await Post.find({
        content: regex,
        type: "post",
    }).sort({ createdAt: -1 }).limit(10);
    return posts.map((post) => toView(post, viewerId));
}

async function searchByTag(tag, viewerId) {
    if (!tag || !tag.trim()) {
        throw new Error("Tag is required");
    }
    const trimmedTag = tag.trim();
    const posts = await Post.find({
        list_tags: trimmedTag,
        type: "post",
    }).sort({ createdAt: -1 }).limit(10);
    return posts.map((post) => toView(post, viewerId));
}

async function getUserPosts(userId, { page, limit } = {}) {
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const posts = await Post.find({ id_user: String(userId), type: "post" })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit + 1);

    const hasMore = posts.length > safeLimit;
    const pagePosts = hasMore ? posts.slice(0, safeLimit) : posts;

    return {
        posts: pagePosts.map((post) => toView(post, userId)),
        hasMore,
    };
}

module.exports = {
    createPost,
    getUserPosts,
    getPostById,
    getPostView,
    deletePost,
    reportPost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
    searchByContent,
    searchByTag,
};
