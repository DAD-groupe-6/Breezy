const axios = require("axios");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const { toView } = require("../utils/postView");
const { extractTags } = require("../utils/tags.util");
const { parsePage, slicePage } = require("../utils/pagination.util");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

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

async function deletePost(id, userId, canModerate = false) {
    const post = await getPostById(id);
    if (!canModerate && post.id_user !== String(userId)) throw new Error("Forbidden");

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
            { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET }, timeout: 5000 }
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
// targetId = le noeud sur lequel on a cliqué "Répondre" (post, commentaire ou réponse).
// On garde l'arbre PLAT (2 niveaux max) en ré-ancrant toujours sur le commentaire racine.
async function addComment(targetId, userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const target = await getPostById(targetId); // 404 si la cible n'existe pas

    // Détermine la conversation racine (rootId) + la cible (replyTo = id du noeud visé).
    // Toute réponse pointe vers le noeud auquel elle répond (commentaire OU réponse) afin
    // de toujours afficher "↳ @pseudo". Seul un commentaire de 1er niveau (réponse au post)
    // n'a pas de cible.
    let rootId = targetId;       // cas post : commentaire de 1er niveau
    let replyTo = null;
    if (target.type === "response") {
        replyTo = target._id; // on répond à ce noeud précis -> "↳ @son auteur"
        const parent = await getPostById(target.parent_id);
        // Réponse à une RÉPONSE -> ré-ancrage sur le commentaire racine ;
        // réponse à un COMMENTAIRE de 1er niveau -> root = ce commentaire.
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
    // On renvoie reply_to_user dès l'ajout (même forme que listComments) pour que la
    // flèche "↳ @pseudo" s'affiche immédiatement, sans rechargement. L'auteur de la
    // cible, c'est simplement target.id_user (déjà chargé).
    return {
        ...toView(comment, userId),
        reply_to_user: replyTo ? target.id_user : null,
    };
}

// Liste paginée des enfants directs d'un parent (commentaires d'un post,
// OU réponses d'un commentaire : même mécanique). Calqué sur getUserPosts.
async function listComments(parentId, viewerId, { page, limit, order } = {}) {
    await getPostById(parentId); // 404 si le parent n'existe pas
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    // Réponses : "asc" (chronologique, nouvelles en bas) ; commentaires : "desc" (récents en haut).
    const sortDir = order === "asc" ? 1 : -1;

    const found = await Post.find({ parent_id: parentId, type: "response" })
        .sort({ createdAt: sortDir, _id: sortDir })
        .skip(skip)
        .limit(safeLimit + 1);

    const { items: pageComments, hasMore } = slicePage(found, safeLimit);

    // Résout l'auteur des cibles "reply_to" (-> id_user) en UNE requête, pour
    // afficher "↳ @pseudo" sans surcoût côté front.
    const targetIds = [
        ...new Set(pageComments.map((c) => c.reply_to).filter(Boolean).map(String)),
    ];
    let authorByTarget = {};
    if (targetIds.length) {
        const targets = await Post.find({ _id: { $in: targetIds } }).select("_id id_user");
        authorByTarget = Object.fromEntries(targets.map((tg) => [String(tg._id), tg.id_user]));
    }

    return {
        comments: pageComments.map((c) => ({
            ...toView(c, viewerId),
            reply_to_user: c.reply_to ? authorByTarget[String(c.reply_to)] ?? null : null,
        })),
        hasMore,
    };
}

async function deleteComment(parentId, commentId, userId, canModerate = false) {
    const comment = await getPostById(commentId);
    if (!canModerate && comment.id_user !== String(userId)) throw new Error("Forbidden");

    // Cascade : si c'est un commentaire racine, on supprime aussi ses réponses.
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
    return { posts: items.map((post) => toView(post, viewerId)), hasMore };
}

async function searchByTag(tag, viewerId, { page, limit } = {}) {
    if (!tag || !tag.trim()) {
        throw new Error("Tag is required");
    }
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    const found = await Post.find({ list_tags: tag.trim(), type: "post" })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit + 1);
    const { items, hasMore } = slicePage(found, safeLimit);
    return { posts: items.map((post) => toView(post, viewerId)), hasMore };
}

async function getUserPosts(userId, { page, limit } = {}) {
    const { safeLimit, skip } = parsePage({ page, limit }, DEFAULT_LIMIT, MAX_LIMIT);
    const query = { id_user: String(userId), type: "post" };
    const [found, total] = await Promise.all([
        Post.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(safeLimit + 1),
        Post.countDocuments(query),
    ]);
    const { items, hasMore } = slicePage(found, safeLimit);
    return { posts: items.map((post) => toView(post, userId)), hasMore, total };
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
