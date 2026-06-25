const MediaService = require("../services/media.service");

/**
 * Moteur de stockage Multer qui écrit directement le fichier dans GridFS.
 */
class GridFsStorage {
    /**
     * Streame le fichier reçu vers GridFS.
     * Entrée : req (Request), file (object Multer), cb (function)
     * Sortie : cb(null, { id, contentType, size }) au succès, cb(err) sinon
     */
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

    /**
     * Supprime le fichier déjà écrit (appelé par Multer si la requête échoue ensuite).
     * Entrée : req (Request), file (object Multer), cb (function)
     * Sortie : cb(null) une fois nettoyé
     */
    _removeFile(req, file, cb) {
        if (!file.id) return cb(null);
        MediaService.deleteImage(String(file.id)).then(() => cb(null), cb);
    }
}

module.exports = GridFsStorage;
