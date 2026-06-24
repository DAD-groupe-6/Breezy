const axios = require("axios");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const Like = require("../models/like.model");
const { toView } = require("../utils/postView");
const { isLikedBy, likedPostIds } = require("../utils/likes.util");
const { extractTags } = require("../utils/tags.util");
const { parsePage, slicePage } = require("../utils/pagination.util");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

// Posts
async function createPost(userId, content, images = [], video = null) {
    const trimmed = (content || "").trim();
    const imgs = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, 4);
    const vid = typeof video === "string" && video.trim() ? video.trim() : null;
    if (!trimmed && imgs.length === 0 && !vid) {
        throw new Error("Content is required");
    }
    const post = await Post.create({
        id_user: String(userId),
        content: trimmed,
        images: imgs,
        video: vid,
        list_tags: extractTags(trimmed),
    });
    return toView(post, false);
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
    const likedByMe = await isLikedBy(post._id, viewerId);
    return toView(post, likedByMe);
}

async function deletePost(id, userId, canModerate = false) {
    const post = await getPostById(id);
    if (!canModerate && post.id_user !== String(userId)) throw new Error("Forbidden");

    await post.deleteOne();
    await Like.deleteMany({ post_id: post._id }); // cascade : likes du post
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
            { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET }, timeout: 5000 }
        );
    } catch (err) {
        if (err.response?.status === 404) {
            throw new Error("User not found");
        }
        throw new Error("Failed to report post");
    }

    await post.deleteOne();
    await Like.deleteMany({ post_id: post._id });
    return {
        message: "Post reported and deleted",
        deleted: true,
        reports: post.nb_signalement,
    };
}

// Likes
async function likePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");

    try {
        await Like.create({ post_id: post._id, user_id: String(userId) });
        post.nb_like += 1;
        await post.save();
    } catch (err) {
        if (err.code !== 11000) throw err; // 11000 = déjà liké → idempotent
    }
    return toView(post, true);
}

async function unlikePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");

    const result = await Like.deleteOne({ post_id: post._id, user_id: String(userId) });
    if (result.deletedCount > 0) { // un like existait → décrémente
        post.nb_like = Math.max(0, post.nb_like - 1);
        await post.save();
    }
    return toView(post, false);
}

// Commentaires 
async function addComment(targetId, userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const target = await getPostById(targetId); // 404 si la cible n'existe pas


    let rootId = targetId;       
    let replyTo = null;
    if (target.type === "response") {
        replyTo = target._id; 
        const parent = await getPostById(target.parent_id);
        rootId = parent.type === "response" ? target.parent_id : target._id;
    }

    const trimmed = content.trim();
    const comment = await Post.create({
        id_user: String(userId),
        content: trimmed,
        type: "response",
        parent_id: rootId,
        reply_to: replyTo,
        list_tags: extractTags(trimmed),
    });
    await Post.findByIdAndUpdate(rootId, { $inc: { commentsCount: 1 } });
    return {
        ...toView(comment, false),
        reply_to_user: replyTo ? target.id_user : null,
    };
}

// Liste paginée des enfants directs d'un parent (commentaires d'un post,ou rép d'un commentaire)
async function listComments(parentId, viewerId, { page, limit, order } = {}) {
    await getPostById(parentId); // 404 si le parent n'existe pas
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    const sortDir = order === "asc" ? 1 : -1;

    const found = await Post.find({ parent_id: parentId, type: "response" })
        .sort({ createdAt: sortDir, _id: sortDir })
        .skip(skip)
        .limit(safeLimit + 1);

    const { items: pageComments, hasMore } = slicePage(found, safeLimit);

    const targetIds = [
        ...new Set(pageComments.map((c) => c.reply_to).filter(Boolean).map(String)),
    ];
    let authorByTarget = {};
    if (targetIds.length) {
        const targets = await Post.find({ _id: { $in: targetIds } }).select("_id id_user");
        authorByTarget = Object.fromEntries(targets.map((tg) => [String(tg._id), tg.id_user]));
    }

    // likes de la page en une requête
    const likedSet = await likedPostIds(pageComments.map((c) => c._id), viewerId);

    return {
        comments: pageComments.map((c) => ({
            ...toView(c, likedSet.has(String(c._id))),
            reply_to_user: c.reply_to ? authorByTarget[String(c.reply_to)] ?? null : null,
        })),
        hasMore,
    };
}

async function deleteComment(parentId, commentId, userId, canModerate = false) {
    const comment = await getPostById(commentId);
    if (!canModerate && comment.id_user !== String(userId)) throw new Error("Forbidden");

    // cascade : likes du commentaire et de ses réponses
    const replies = await Post.find({ parent_id: commentId, type: "response" }).select("_id");
    const deletedIds = [comment._id, ...replies.map((r) => r._id)];
    await Like.deleteMany({ post_id: { $in: deletedIds } });

    // cascade : réponses du commentaire
    await Post.deleteMany({ parent_id: commentId, type: "response" });
    await comment.deleteOne();
    await Post.findByIdAndUpdate(parentId, { $inc: { commentsCount: -1 } });
    return { message: "Comment deleted" };
}

// Recherche
async function searchByContent(keywords, viewerId, { page, limit } = {}) {
    if (!keywords || !keywords.trim()) {
        throw new Error("Keywords are required");
    }
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    const regex = new RegExp(keywords, "i");
    const found = await Post.find({ content: regex, type: "post" })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit + 1);
    const { items, hasMore } = slicePage(found, safeLimit);
    const likedSet = await likedPostIds(items.map((p) => p._id), viewerId);
    return { posts: items.map((post) => toView(post, likedSet.has(String(post._id)))), hasMore };
}

async function searchByTag(tag, viewerId, { page, limit } = {}) {
    if (!tag || !tag.trim()) {
        throw new Error("Tag is required");
    }
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    const found = await Post.find({ list_tags: tag.trim().toLowerCase(), type: "post" })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit + 1);
    const { items, hasMore } = slicePage(found, safeLimit);
    const likedSet = await likedPostIds(items.map((p) => p._id), viewerId);
    return { posts: items.map((post) => toView(post, likedSet.has(String(post._id)))), hasMore };
}

async function getUserPosts(userId, viewerId, { page, limit } = {}) {
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    const query = { id_user: String(userId), type: "post" };
    const [found, total] = await Promise.all([
        Post.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(safeLimit + 1),
        Post.countDocuments(query),
    ]);
    const { items, hasMore } = slicePage(found, safeLimit);
    const likedSet = await likedPostIds(items.map((p) => p._id), viewerId);
    return { posts: items.map((post) => toView(post, likedSet.has(String(post._id)))), hasMore, total };
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
