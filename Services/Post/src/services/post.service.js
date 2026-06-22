const axios = require("axios");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const Like = require("../models/like.model");
const { toView } = require("../utils/postView");
const { isLikedBy, likedPostIds } = require("../utils/likes.util");
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
    // Post tout neuf : nb_like = 0 (défaut) et personne ne l'a encore liké.
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

async function deletePost(id, userId) {
    const post = await getPostById(id);
    if (post.id_user !== String(userId)) throw new Error("Forbidden");

    await post.deleteOne();
    // On nettoie les likes orphelins : sans ça, ils pointeraient vers un post supprimé.
    await Like.deleteMany({ post_id: post._id });
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
        // On crée le document Like. L'index unique (post_id, user_id) garantit
        // qu'un même user ne peut liker qu'une fois.
        await Like.create({ post_id: post._id, user_id: String(userId) });
        // On n'incrémente le compteur QUE si le like est nouveau (sinon on tombe
        // dans le catch ci-dessous sans toucher nb_like).
        post.nb_like += 1;
        await post.save();
    } catch (err) {
        // 11000 = clé dupliquée → le user avait déjà liké. C'est idempotent
        // (comme $addToSet avant), donc on ignore et on renvoie l'état courant.
        if (err.code !== 11000) throw err;
    }
    return toView(post, true);
}

async function unlikePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");

    const result = await Like.deleteOne({ post_id: post._id, user_id: String(userId) });
    // deletedCount > 0 → un like existait vraiment. On ne décrémente que dans ce cas
    // (un unlike répété ne fait pas descendre le compteur dans le négatif).
    if (result.deletedCount > 0) {
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
        // Commentaire tout neuf : pas encore liké.
        ...toView(comment, false),
        reply_to_user: replyTo ? target.id_user : null,
    };
}

// Liste paginée des enfants directs d'un parent (commentaires d'un post,ou rép d'un commentaire)
async function listComments(parentId, viewerId, { page, limit, order } = {}) {
    await getPostById(parentId); // 404 si le parent n'existe pas
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const sortDir = order === "asc" ? 1 : -1;

    const found = await Post.find({ parent_id: parentId, type: "response" })
        .sort({ createdAt: sortDir, _id: sortDir })
        .skip(skip)
        .limit(safeLimit + 1);

    const hasMore = found.length > safeLimit;
    const pageComments = hasMore ? found.slice(0, safeLimit) : found;

    const targetIds = [
        ...new Set(pageComments.map((c) => c.reply_to).filter(Boolean).map(String)),
    ];
    let authorByTarget = {};
    if (targetIds.length) {
        const targets = await Post.find({ _id: { $in: targetIds } }).select("_id id_user");
        authorByTarget = Object.fromEntries(targets.map((tg) => [String(tg._id), tg.id_user]));
    }

    // Likes de la page en UNE requête (les commentaires sont des posts → même collection Like).
    const likedSet = await likedPostIds(pageComments.map((c) => c._id), viewerId);

    return {
        comments: pageComments.map((c) => ({
            ...toView(c, likedSet.has(String(c._id))),
            reply_to_user: c.reply_to ? authorByTarget[String(c.reply_to)] ?? null : null,
        })),
        hasMore,
    };
}

async function deleteComment(parentId, commentId, userId) {
    const comment = await getPostById(commentId);
    if (comment.id_user !== String(userId)) throw new Error("Forbidden");

    // On récupère les réponses AVANT de supprimer, pour nettoyer leurs likes aussi.
    const replies = await Post.find({ parent_id: commentId, type: "response" }).select("_id");
    const deletedIds = [comment._id, ...replies.map((r) => r._id)];
    // Cascade likes : ceux du commentaire ET de toutes ses réponses.
    await Like.deleteMany({ post_id: { $in: deletedIds } });

    // Cascade : si c'est un commentaire racine, on supprime aussi ses réponses.
    await Post.deleteMany({ parent_id: commentId, type: "response" });
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
    const likedSet = await likedPostIds(posts.map((p) => p._id), viewerId);
    return posts.map((post) => toView(post, likedSet.has(String(post._id))));
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
    const likedSet = await likedPostIds(posts.map((p) => p._id), viewerId);
    return posts.map((post) => toView(post, likedSet.has(String(post._id))));
}

async function getUserPosts(userId, viewerId, { page, limit } = {}) {
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    // userId = l'auteur dont on liste les posts.
    const posts = await Post.find({ id_user: String(userId), type: "post" })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit + 1);

    const hasMore = posts.length > safeLimit;
    const pagePosts = hasMore ? posts.slice(0, safeLimit) : posts;

    // viewerId = l'utilisateur connecté : c'est SON likedByMe qu'on calcule.
    const likedSet = await likedPostIds(pagePosts.map((p) => p._id), viewerId);
    return {
        posts: pagePosts.map((post) => toView(post, likedSet.has(String(post._id)))),
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
