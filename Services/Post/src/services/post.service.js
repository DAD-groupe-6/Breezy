const axios = require("axios");
const mongoose = require("mongoose");
const Post = require("../models/post.model");
const Like = require("../models/like.model");
const { toView } = require("../utils/postView");
const { isLikedBy, likedPostIds } = require("../utils/likes.util");
const { extractTags } = require("../utils/tags.util");
const { extractMentions } = require("../utils/mentions.util");
const { parsePage, slicePage } = require("../utils/pagination.util");
const { publishEvent } = require("../messaging/publisher");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

/**
 * Notifie les @pseudo_uniq mentionnés (best-effort, résolus via le service User).
 * Entrée : content (string), ctx (object) { actorId, postId, commentId? }
 * Sortie : rien (publie des events post.mentioned)
 */
async function publishMentions(content, { actorId, postId, commentId = null }) {
    const handles = extractMentions(content);
    if (!handles.length) return;

    const recipients = new Set();
    await Promise.all(handles.map(async (handle) => {
        try {
            const { data } = await axios.get(`${USER_SERVICE_URL}/api/v1/user/search`, {
                params: { pseudo_uniq: handle },
                headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
                timeout: 5000,
            });
            const match = (data || []).find((u) => String(u.pseudo_uniq).toLowerCase() === handle);
            if (match && String(match.id_user) !== String(actorId)) {
                recipients.add(String(match.id_user));
            }
        } catch (err) {
        }
    }));

    for (const recipientId of recipients) {
        publishEvent("post.mentioned", { recipientId, actorId: String(actorId), postId, commentId });
    }
}

/**
 * Crée un post (texte et/ou médias), extrait ses tags et notifie les mentions.
 * Entrée : userId (string), content (string), images (array), video (string|null)
 * Sortie : post (view) ; throw "Content is required" si tout est vide
 */
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
    publishMentions(trimmed, { actorId: String(userId), postId: String(post._id) }).catch(() => {});
    return toView(post, false);
}

/**
 * Récupère un document Post par son id.
 * Entrée : id (string)
 * Sortie : post (object document) ; throw "Post not found"
 */
async function getPostById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Post not found");
    }
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");
    return post;
}

/**
 * Récupère un post au format API, avec l'état "liké par le viewer".
 * Entrée : id (string), viewerId (string|null)
 * Sortie : post (view)
 */
async function getPostView(id, viewerId) {
    const post = await getPostById(id);
    const likedByMe = await isLikedBy(post._id, viewerId);
    return toView(post, likedByMe);
}

/**
 * Supprime un post (auteur, ou modérateur) et ses likes en cascade.
 * Entrée : id (string), userId (string), canModerate (boolean)
 * Sortie : result (object) { message } ; throw "Forbidden" si non autorisé
 */
async function deletePost(id, userId, canModerate = false) {
    const post = await getPostById(id);
    if (!canModerate && post.id_user !== String(userId)) throw new Error("Forbidden");

    await post.deleteOne();
    await Like.deleteMany({ post_id: post._id });
    return { message: "Post deleted" };
}

/**
 * Édite le contenu d'un post (auteur seul), ré-extrait les tags et marque comme édité.
 * Entrée : id (string), userId (string), content (string)
 * Sortie : post (view) ; throw "Forbidden" / "Content is required"
 */
async function editPost(id, userId, content) {
    const post = await getPostById(id);
    if (post.id_user !== String(userId)) throw new Error("Forbidden");

    const trimmed = (content || "").trim();
    if (!trimmed && (post.images?.length ?? 0) === 0 && !post.video) {
        throw new Error("Content is required");
    }

    post.content = trimmed;
    post.list_tags = extractTags(trimmed);
    post.edited = true;
    await post.save();

    const likedByMe = await isLikedBy(post._id, userId);
    return toView(post, likedByMe);
}

/**
 * Signale un post ; au 3e signalement, signale l'auteur côté User et supprime le post.
 * Entrée : id (string), reporterId (string)
 * Sortie : result (object) { message, deleted, reports } ; throw selon le cas
 */
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

/**
 * Like un post (idempotent grâce à l'index unique) et notifie l'auteur.
 * Entrée : id (string), userId (string)
 * Sortie : post (view, liké) ; throw "Post not found"
 */
async function likePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");

    let isNewLike = false;
    try {
        await Like.create({ post_id: post._id, user_id: String(userId) });
        post.nb_like += 1;
        await post.save();
        isNewLike = true;
    } catch (err) {
        if (err.code !== 11000) throw err;
    }

    if (isNewLike && post.id_user !== String(userId)) {
        publishEvent("post.liked", {
            recipientId: post.id_user,
            actorId: String(userId),
            postId: String(post._id),
        });
    }
    return toView(post, true);
}

/**
 * Retire le like d'un post (décrémente le compteur si un like existait).
 * Entrée : id (string), userId (string)
 * Sortie : post (view, non liké) ; throw "Post not found"
 */
async function unlikePost(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Post not found");
    const post = await Post.findById(id);
    if (!post) throw new Error("Post not found");

    const result = await Like.deleteOne({ post_id: post._id, user_id: String(userId) });
    if (result.deletedCount > 0) {
        post.nb_like = Math.max(0, post.nb_like - 1);
        await post.save();
    }
    return toView(post, false);
}

/**
 * Ajoute un commentaire (ou une réponse), rattaché à la racine, et notifie auteur + mentions.
 * Entrée : targetId (string), userId (string), content (string)
 * Sortie : comment (view + reply_to_user) ; throw "Content is required" / "Post not found"
 */
async function addComment(targetId, userId, content) {
    if (!content || !content.trim()) {
        throw new Error("Content is required");
    }
    const target = await getPostById(targetId);


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

    if (target.id_user !== String(userId)) {
        publishEvent("post.commented", {
            recipientId: target.id_user,
            actorId: String(userId),
            postId: String(target._id),
            commentId: String(comment._id),
        });
    }

    publishMentions(trimmed, {
        actorId: String(userId),
        postId: String(target._id),
        commentId: String(comment._id),
    }).catch(() => {});

    return {
        ...toView(comment, false),
        reply_to_user: replyTo ? target.id_user : null,
    };
}

/**
 * Liste paginée des enfants directs d'un parent (commentaires d'un post ou réponses d'un commentaire).
 * Entrée : parentId (string), viewerId (string|null), options (object) { page, limit, order }
 * Sortie : result (object) { comments, hasMore }
 */
async function listComments(parentId, viewerId, { page, limit, order } = {}) {
    await getPostById(parentId);
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

    const likedSet = await likedPostIds(pageComments.map((c) => c._id), viewerId);

    return {
        comments: pageComments.map((c) => ({
            ...toView(c, likedSet.has(String(c._id))),
            reply_to_user: c.reply_to ? authorByTarget[String(c.reply_to)] ?? null : null,
        })),
        hasMore,
    };
}

/**
 * Supprime un commentaire (auteur ou modérateur), ses réponses et leurs likes en cascade.
 * Entrée : parentId (string), commentId (string), userId (string), canModerate (boolean)
 * Sortie : result (object) { message } ; throw "Forbidden" si non autorisé
 */
async function deleteComment(parentId, commentId, userId, canModerate = false) {
    const comment = await getPostById(commentId);
    if (!canModerate && comment.id_user !== String(userId)) throw new Error("Forbidden");

    const replies = await Post.find({ parent_id: commentId, type: "response" }).select("_id");
    const deletedIds = [comment._id, ...replies.map((r) => r._id)];
    await Like.deleteMany({ post_id: { $in: deletedIds } });

    await Post.deleteMany({ parent_id: commentId, type: "response" });
    await comment.deleteOne();
    await Post.findByIdAndUpdate(parentId, { $inc: { commentsCount: -1 } });
    return { message: "Comment deleted" };
}

/**
 * Recherche des posts dont le contenu correspond aux mots-clés (insensible à la casse).
 * Entrée : keywords (string), viewerId (string|null), options (object) { page, limit }
 * Sortie : result (object) { posts, hasMore } ; throw "Keywords are required"
 */
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

/**
 * Recherche les posts portant un tag donné.
 * Entrée : tag (string), viewerId (string|null), options (object) { page, limit }
 * Sortie : result (object) { posts, hasMore } ; throw "Tag is required"
 */
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

/**
 * Liste paginée des posts d'un utilisateur, avec le total.
 * Entrée : userId (string), viewerId (string|null), options (object) { page, limit }
 * Sortie : result (object) { posts, hasMore, total }
 */
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

/**
 * Compte les posts d'un utilisateur sans renvoyer leur contenu (compteur de profil).
 * Entrée : userId (string)
 * Sortie : count (number)
 */
async function countUserPosts(userId) {
    return Post.countDocuments({ id_user: String(userId), type: "post" });
}

module.exports = {
    createPost,
    getUserPosts,
    countUserPosts,
    getPostById,
    getPostView,
    deletePost,
    editPost,
    reportPost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
    searchByContent,
    searchByTag,
};
