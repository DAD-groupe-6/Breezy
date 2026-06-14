const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/upload.middleware");

router.get("/", authenticate, PostController.getFeed);
router.get("/media/:id", PostController.getMedia);
router.get("/:id", authenticate, PostController.getPost);

router.post("/", authenticate, uploadImage, PostController.createPost);
router.put("/:id", authenticate, PostController.updatePost);
router.delete("/:id", authenticate, PostController.deletePost);

router.post("/:id/like", authenticate, PostController.likePost);
router.delete("/:id/like", authenticate, PostController.unlikePost);

router.post("/:id/comments", authenticate, PostController.addComment);
router.get("/:id/comments", authenticate, PostController.listComments);
router.delete("/:id/comments/:commentId", authenticate, PostController.deleteComment);

router.post("/:id/comments/:commentId/like", authenticate, PostController.likeComment);
router.delete("/:id/comments/:commentId/like", authenticate, PostController.unlikeComment);

module.exports = router;
