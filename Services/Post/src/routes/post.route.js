const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/", authenticate, PostController.getFeed);
router.get("/:id", authenticate, PostController.getPost);

router.post("/", authenticate, PostController.createPost);
router.put("/:id", authenticate, PostController.updatePost);
router.delete("/:id", authenticate, PostController.deletePost);

router.post("/:id/like", authenticate, PostController.likePost);
router.delete("/:id/like", authenticate, PostController.unlikePost);

module.exports = router;
