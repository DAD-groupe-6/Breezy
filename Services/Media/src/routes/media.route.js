const express = require("express");
const multer = require("multer");
const MediaController = require("../controllers/media.controllers");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
});

router.post("/", authenticate, upload.single("image"), MediaController.upload);
router.get("/:id", MediaController.getOne);
router.delete("/:id", authenticate, MediaController.remove);

module.exports = router;