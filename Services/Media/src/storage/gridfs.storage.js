const MediaService = require("../services/media.service");


class GridFsStorage {
    _handleFile(req, file, cb) {
        const uploadStream = MediaService.openUploadStream(
            file.originalname,
            file.mimetype
        );

        file.stream.on("error", (err) => uploadStream.destroy(err));
        uploadStream.on("error", cb);
        uploadStream.on("finish", () =>
            cb(null, {
                id: uploadStream.id,
                contentType: file.mimetype,
                size: uploadStream.length,
            })
        );

        file.stream.pipe(uploadStream);
    }

    _removeFile(req, file, cb) {
        if (!file.id) return cb(null);
        MediaService.deleteImage(String(file.id)).then(() => cb(null), cb);
    }
}

module.exports = GridFsStorage;
