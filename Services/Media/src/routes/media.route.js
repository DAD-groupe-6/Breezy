const express = require("express");
const multer = require("multer");
const MediaController = require("../controllers/media.controllers");
const GridFsStorage = require("../storage/gridfs.storage");
const { ALLOWED_TYPES } = require("../services/media.service");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

const upload = multer({
    storage: new GridFsStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
});

router.post("/", authenticate, upload.single("image"), MediaController.upload);
router.get("/:id", MediaController.getOne);
router.delete("/:id", authenticate, MediaController.remove);

module.exports = router;