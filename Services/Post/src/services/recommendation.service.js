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

async function getRecentPosts(excludeIds, limit) {
    const query = {
        id_user: { $nin: excludeIds.map(String) }
    };

    return await Post.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit);
}

async function getRecommendedPosts(userId, { limit, before } = {}) {
    const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    try {
        const followingResponse = await axios.get(
            `${USER_SERVICE_URL}/api/v1/user/${userId}/following`,
            { timeout: 5000 }
        );
        const followingUsers = followingResponse.data.following || [];

        let query = {};
        let posts = [];

        if (followingUsers.length > 0) {
            query = {
                id_user: { $in: followingUsers.map(String) }
            };

            if (before && mongoose.Types.ObjectId.isValid(before)) {
                query._id = { $lt: before };
            }

            posts = await Post.find(query)
                .sort({ createdAt: -1, _id: -1 })
                .limit(safeLimit);
        }

        if (posts.length < safeLimit) {
            const remainingCount = safeLimit - posts.length;
            const followedIds = [...followingUsers.map(String), String(userId)];

            let randomQuery = {
                id_user: { $nin: followedIds.map(String) }
            };

            if (before && mongoose.Types.ObjectId.isValid(before)) {
                randomQuery._id = { $lt: before };
            }

            const randomPosts = await Post.find(randomQuery)
                .sort({ createdAt: -1, _id: -1 })
                .limit(remainingCount);
            posts = [...posts, ...randomPosts];
        }

        const nextCursor =
            posts.length === safeLimit ? posts[posts.length - 1]._id : null;

        return {
            posts: posts.map((post) => toView(post, userId)),
            nextCursor
        };
    } catch (err) {
        if (err.response?.status === 404) {
            // User not found - return recent posts to everyone
            const query = { id_user: { $nin: [String(userId)] } };
            if (before && mongoose.Types.ObjectId.isValid(before)) {
                query._id = { $lt: before };
            }
            const posts = await Post.find(query)
                .sort({ createdAt: -1, _id: -1 })
                .limit(DEFAULT_LIMIT);
            const nextCursor =
                posts.length === DEFAULT_LIMIT ? posts[posts.length - 1]._id : null;
            return {
                posts: posts.map((post) => toView(post, userId)),
                nextCursor
            };
        }
        throw new Error(`Failed to fetch recommendations: ${err.message}`);
    }
}

module.exports = {
    getRecommendedPosts,
};
