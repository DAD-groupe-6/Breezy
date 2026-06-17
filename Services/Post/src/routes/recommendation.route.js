const express = require("express");
const router = express.Router();
const RecommendationController = require("../controllers/recommendation.controller");
const { authenticate } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/v1/post/recommendations/{userId}:
 *   get:
 *     summary: Get recommended posts for a user
 *     description: Returns a list of posts from users that the authenticated user follows, sorted by most recent
 *     tags:
 *       - Recommendations
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get recommendations for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Number of posts to return
 *     responses:
 *       200:
 *         description: List of recommended posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/:userId", authenticate, RecommendationController.getRecommendedPosts);

module.exports = router;
