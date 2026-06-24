const PostService = require("../services/post.service");
const axios = require("axios");

const USER_SERVICE_BASE_URL = process.env.USER_SERVICE_BASE_URL || "http://service-user:3000/api/v1/user";
const USER_SEARCH_TIMEOUT_MS = Number.parseInt(process.env.USER_SEARCH_TIMEOUT_MS || "2500", 10);
const SEARCH_KINDS = ["tag", "profile", "content"];

function normalizeKind(kind) {
    return SEARCH_KINDS.includes(kind) ? kind : null;
}

function inferKindFromQuery(query) {
    if (!query || !query.trim()) return null;
    if (query.startsWith("#")) return "tag";
    if (query.startsWith("@")) return "profile";
    return "content";
}

function normalizeQueryForKind(query, kind) {
    const trimmed = (query || "").trim();
    if (!trimmed) return "";
    if (kind === "tag") return trimmed.startsWith("#") ? trimmed.slice(1).trim() : trimmed;
    if (kind === "profile") return trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
    return trimmed;
}

function parseLimit(limit, fallback = 10, max = 50) {
    const parsed = Number.parseInt(limit, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
}

function parsePage(page, fallback = 1) {
    const parsed = Number.parseInt(page, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
}

function buildSearchResponse({ kind, rawQuery, normalizedQuery, page, limit, hasMore, items }) {
    return {
        version: 1,
        query: {
            kind,
            raw: rawQuery,
            normalized: normalizedQuery,
        },
        pagination: {
            page,
            limit,
            hasMore,
        },
        results: items,
        // Backward compatibility for existing clients.
        kind,
        hasMore,
        items,
    };
}

function mapSearchDownstreamError(err) {
    if (err.response?.status) return err.response.status;

    if (err.code === "ECONNABORTED") return 504;
    if (["ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH", "EAI_AGAIN"].includes(err.code)) return 503;

    return 502;
}

async function runPostSearch(kind, normalizedQuery, viewerId, page, limit) {
    if (kind === "tag") {
        return PostService.searchByTag(normalizedQuery, viewerId, { page, limit });
    }
    return PostService.searchByContent(normalizedQuery, viewerId, { page, limit });
}

function statusFor(message) {
    switch (message) {
        case "Post not found":
            return 404;
        case "Comment not found":
            return 404;
        case "User not found":
            return 404;
        case "Forbidden":
            return 403;
        case "Failed to report post":
            return 502;
        case "Cannot report your own post":
            return 403;
        case "Already reported":
            return 409;
        default:
            return 400;
    }
}

// Posts
async function createPost(req, res) {
    try {
        const { content, images, video } = req.body;
        const post = await PostService.createPost(req.user.id, content, images, video);
        res.status(201).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function getPost(req, res) {
    try {
        const post = await PostService.getPostView(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function getUserPosts(req, res) {
    try {
        const role = req.user?.role;
        if (role === "utilisateur" && String(req.user.id) !== String(req.params.userId)) {
            return res.status(403).json({ message: "You can only view your own posts" });
        }
        const { page, limit } = req.query;
        // req.params.userId = l'auteur du profil visité ; req.user.id = le viewer connecté.
        // Les deux sont distincts : sinon likedByMe serait calculé pour l'auteur, pas pour moi.
        const result = await PostService.getUserPosts(req.params.userId, req.user.id, { page, limit });
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}


async function deletePost(req, res) {
    try {
        const canModerate = ["moderateur", "administrateur"].includes(req.user?.role);
        const result = await PostService.deletePost(req.params.id, req.user.id, canModerate);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function reportPost(req, res) {
    try {
        const result = await PostService.reportPost(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

// Likes
async function likePost(req, res) {
    try {
        const post = await PostService.likePost(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function unlikePost(req, res) {
    try {
        const post = await PostService.unlikePost(req.params.id, req.user.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

// Commentaires
async function addComment(req, res) {
    try {
        const { content } = req.body;
        const comment = await PostService.addComment(
            req.params.id,
            req.user.id,
            content
        );
        res.status(201).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function listComments(req, res) {
    try {
        const { page, limit, order } = req.query;
        const comments = await PostService.listComments(req.params.id, req.user.id, {
            page,
            limit,
            order,
        });
        res.status(200).json(comments);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function deleteComment(req, res) {
    try {
        const canModerate = ["moderateur", "administrateur"].includes(req.user?.role);
        const result = await PostService.deleteComment(
            req.params.id,
            req.params.commentId,
            req.user.id,
            canModerate
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

// Un commentaire est un post : on like/unlike directement par son id (commentId).
async function likeComment(req, res) {
    try {
        const comment = await PostService.likePost(req.params.commentId, req.user.id);
        res.status(200).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function unlikeComment(req, res) {
    try {
        const comment = await PostService.unlikePost(req.params.commentId, req.user.id);
        res.status(200).json(comment);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function search(req, res) {
    try {
        const rawQuery = req.query.q || "";
        const explicitKind = normalizeKind(req.query.kind || null);
        const resolvedKind = explicitKind || inferKindFromQuery(rawQuery);

        if (!resolvedKind) {
            return res.status(400).json({ message: "q parameter is required" });
        }

        const normalizedQuery = normalizeQueryForKind(rawQuery, resolvedKind);
        if (!normalizedQuery) {
            return res.status(400).json({ message: "q parameter is required" });
        }

        const { page, limit } = req.query;
        const safePage = parsePage(page);
        const safeLimit = parseLimit(limit);

        if (resolvedKind === "tag" || resolvedKind === "content") {
            const result = await runPostSearch(resolvedKind, normalizedQuery, req.user.id, safePage, safeLimit);
            return res.status(200).json(buildSearchResponse({
                kind: resolvedKind,
                rawQuery,
                normalizedQuery,
                page: safePage,
                limit: safeLimit,
                hasMore: Boolean(result.hasMore),
                items: result.posts,
            }));
        }

        const authHeader = req.headers["authorization"];
        const { data } = await axios.get(`${USER_SERVICE_BASE_URL}/search`, {
            params: {
                pseudo_uniq: normalizedQuery,
                page: safePage,
                limit: safeLimit,
                includeMeta: 1,
            },
            headers: authHeader ? { Authorization: authHeader } : undefined,
            timeout: USER_SEARCH_TIMEOUT_MS,
        });

        const users = Array.isArray(data?.users)
            ? data.users
            : (Array.isArray(data) ? data : []);
        const hasMeta = typeof data?.pagination?.hasMore === "boolean";
        const hasMore = hasMeta ? data.pagination.hasMore : users.length >= safeLimit;

        return res.status(200).json(buildSearchResponse({
            kind: resolvedKind,
            rawQuery,
            normalizedQuery,
            page: safePage,
            limit: safeLimit,
            hasMore,
            items: users,
        }));
    } catch (err) {
        if (err.response?.status) {
            return res.status(err.response.status).json(err.response.data || { message: "Search request failed" });
        }
        const downstreamStatus = mapSearchDownstreamError(err);
        return res.status(downstreamStatus).json({ message: "Search request failed" });
    }
}

module.exports = {
    createPost,
    getPost,
    getUserPosts,
    deletePost,
    reportPost,
    likePost,
    unlikePost,
    addComment,
    listComments,
    deleteComment,
    likeComment,
    unlikeComment,
    search,
};
