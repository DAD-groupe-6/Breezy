const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Lecture publique
router.get("/", PostController.getFeed);
router.get("/:id", PostController.getPost);

// Écriture protégée (JWT requis)
router.post("/", authenticate, PostController.createPost);
router.put("/:id", authenticate, PostController.updatePost);
router.delete("/:id", authenticate, PostController.deletePost);

module.exports = router;
