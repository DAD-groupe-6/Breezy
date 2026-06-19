const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Recherche et routes spécifiques avant les routes dynamiques `/:id`.
router.get("/search/content", authenticate, PostController.searchByContent);
router.get("/search/tags/:tag", authenticate, PostController.searchByTag);
router.get("/user/:userId", authenticate, PostController.getUserPosts);

router.get("/:id", authenticate, PostController.getPost);

router.post("/", authenticate, PostController.createPost);
router.delete("/:id", authenticate, PostController.deletePost);
router.post("/:id/report", authenticate, PostController.reportPost);

router.post("/:id/like", authenticate, PostController.likePost);
router.delete("/:id/like", authenticate, PostController.unlikePost);

router.post("/:id/comments", authenticate, PostController.addComment);
router.get("/:id/comments", authenticate, PostController.listComments);
router.delete("/:id/comments/:commentId", authenticate, PostController.deleteComment);

router.post("/:id/comments/:commentId/like", authenticate, PostController.likeComment);
router.delete("/:id/comments/:commentId/like", authenticate, PostController.unlikeComment);

module.exports = router;
