const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

// Recherche et routes spécifiques avant les routes dynamiques `/:id`.
router.get("/search/content", authenticate({ optional: true }), requirePermission("search"), PostController.searchByContent);
router.get("/search/tags/:tag", authenticate({ optional: true }), requirePermission("search"), PostController.searchByTag);
// Ses propres posts sont toujours visibles ; voir ceux d'un autre profil exige `view_others_posts` (vérifié dans le contrôleur).
router.get("/user/:userId", authenticate({ optional: true }), PostController.getUserPosts);

// Consultation d'un post ouverte à tout utilisateur authentifié (view_profile_posts supprimée).
router.get("/:id", authenticate({ optional: true }), PostController.getPost);

router.post("/", authenticate({ optional: true }), requirePermission("publish_post"), PostController.createPost);
router.put("/:id", authenticate({ optional: true }), requirePermission("publish_post"), PostController.editPost);
router.delete("/:id", authenticate({ optional: true }), requirePermission("publish_post"), PostController.deletePost);
router.post("/:id/report", authenticate({ optional: true }), requirePermission("report_content"), PostController.reportPost);

router.post("/:id/like", authenticate({ optional: true }), requirePermission("like_post"), PostController.likePost);
router.delete("/:id/like", authenticate({ optional: true }), requirePermission("like_post"), PostController.unlikePost);

router.post("/:id/comments", authenticate({ optional: true }), requirePermission("publish_post"), PostController.addComment);
router.get("/:id/comments", authenticate({ optional: true }), PostController.listComments);
router.delete("/:id/comments/:commentId", authenticate({ optional: true }), requirePermission("publish_post"), PostController.deleteComment);

router.post("/:id/comments/:commentId/like", authenticate({ optional: true }), requirePermission("like_post"), PostController.likeComment);
router.delete("/:id/comments/:commentId/like", authenticate({ optional: true }), requirePermission("like_post"), PostController.unlikeComment);

module.exports = router;
