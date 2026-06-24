const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { optionalAuthenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

// Recherche et routes spécifiques avant les routes dynamiques `/:id`.
router.get("/search", optionalAuthenticate, requirePermission("search_tags"), PostController.search);
router.get("/user/:userId", optionalAuthenticate, requirePermission("list_user_posts"), PostController.getUserPosts);

router.get("/:id", optionalAuthenticate, requirePermission("view_profile_posts"), PostController.getPost);

router.post("/", optionalAuthenticate, requirePermission("publish_post"), PostController.createPost);
router.delete("/:id", optionalAuthenticate, requirePermission("publish_post"), PostController.deletePost);
router.post("/:id/report", optionalAuthenticate, requirePermission("report_content"), PostController.reportPost);

router.post("/:id/like", optionalAuthenticate, requirePermission("like_post"), PostController.likePost);
router.delete("/:id/like", optionalAuthenticate, requirePermission("like_post"), PostController.unlikePost);

router.post("/:id/comments", optionalAuthenticate, requirePermission("reply_post"), PostController.addComment);
router.get("/:id/comments", optionalAuthenticate, requirePermission("view_profile_posts"), PostController.listComments);
router.delete("/:id/comments/:commentId", optionalAuthenticate, requirePermission("reply_post"), PostController.deleteComment);

router.post("/:id/comments/:commentId/like", optionalAuthenticate, requirePermission("like_post"), PostController.likeComment);
router.delete("/:id/comments/:commentId/like", optionalAuthenticate, requirePermission("like_post"), PostController.unlikeComment);

module.exports = router;
