const MediaService = require("../services/media.service");
const logger = require("../logger");

async function upload(req, res) {
    try {
        const id = await MediaService.uploadImage(req.file);
        res.status(201).json({ id: String(id), url: `/api/v1/media/${id}` });
    } catch (err) {
        logger.error(`Upload failed: ${err.message}`);
        res.status(400).json({ message: err.message });
    }
}

async function getOne(req, res) {
    try {
        const fileInfo = await MediaService.getFileInfo(req.params.id);

        res.set("Content-Type", fileInfo.contentType);
        res.set("Cache-Control", "public, max-age=31536000"); // cache 1 an

        const readStream = MediaService.getReadStream(req.params.id);

        readStream.on("error", () => {
            res.status(404).json({ message: "File not found" });
        });

        readStream.pipe(res);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function remove(req, res) {
    try {
        const result = await MediaService.deleteImage(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = { upload, getOne, remove };