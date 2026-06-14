const multer = require("multer");

const MAX_SIZE = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    },
});

function uploadImage(req, res, next) {
    upload.single("image")(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}

module.exports = { uploadImage };
