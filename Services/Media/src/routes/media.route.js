const express = require("express");
const multer = require("multer");
const MediaController = require("../controllers/media.controllers");
const GridFsStorage = require("../storage/gridfs.storage");
const { ALLOWED_TYPES } = require("../services/media.service");
const { authenticate } = require("../middlewares/auth.middleware");
const { roleHasPermission } = require("../middlewares/permission.middleware");

const router = express.Router();

const upload = multer({
    storage: new GridFsStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    /**
     * Filtre chaque fichier avant écriture : type autorisé + permission selon le média
     * (vidéo => add_videos, sinon add_images).
     * Entrée : req (Request), file (object Multer), cb (function)
     * Sortie : cb(null, true) si accepté, cb(err) sinon (err.status 403/503)
     */
    fileFilter: async (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"));
        }
        const permission = file.mimetype.startsWith("video/") ? "add_videos" : "add_images";
        try {
            if (!(await roleHasPermission(req.user?.roleId, permission))) {
                const err = new Error("Insufficient permissions");
                err.status = 403;
                return cb(err);
            }
            cb(null, true);
        } catch {
            const err = new Error("Permission service unavailable");
            err.status = 503;
            cb(err);
        }
    },
});

router.post("/", authenticate, upload.single("image"), MediaController.upload);
router.get("/:id", MediaController.getOne);
router.delete("/:id", authenticate, MediaController.remove);

module.exports = router;