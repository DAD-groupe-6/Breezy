const MediaService = require("../services/media.service");
const logger = require("../logger");

/**
 * Confirme l'upload (le fichier a déjà été écrit par le moteur de stockage Multer).
 * Entrée : req.file (object) posé par Multer
 * Sortie : 201 { id, url } ; 400 si aucun fichier
 */
async function upload(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }
    res.status(201).json({
        id: String(req.file.id),
        url: `/api/v1/media/${req.file.id}`,
    });
}

/**
 * Sert un média en streaming, avec gestion des requêtes par plage (Range) pour la vidéo.
 * Entrée : req.params.id (string), req.headers.range (string, optionnel)
 * Sortie : flux 200 (complet) ou 206 (plage) ; 416 si plage invalide, 404 si introuvable
 */
async function getOne(req, res) {
    try {
        const fileInfo = await MediaService.getFileInfo(req.params.id);
        const total = fileInfo.length;

        res.set("Content-Type", fileInfo.contentType);
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Accept-Ranges", "bytes");

        const range = req.headers.range;

        if (!range) {
            res.set("Content-Length", total);
            const readStream = MediaService.getReadStream(req.params.id);
            readStream.on("error", () => res.destroy());
            return readStream.pipe(res);
        }

        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        const start = match && match[1] !== "" ? parseInt(match[1], 10) : 0;
        const end = match && match[2] !== "" ? parseInt(match[2], 10) : total - 1;

        if (!match || isNaN(start) || isNaN(end) || start > end || end >= total) {
            res.set("Content-Range", `bytes */${total}`);
            return res.status(416).end();
        }

        res.status(206);
        res.set("Content-Range", `bytes ${start}-${end}/${total}`);
        res.set("Content-Length", end - start + 1);

        const readStream = MediaService.getReadStream(req.params.id, {
            start,
            end: end + 1,
        });
        readStream.on("error", () => res.destroy());
        readStream.pipe(res);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

/**
 * Supprime un média.
 * Entrée : req.params.id (string)
 * Sortie : 200 result { id } ; 404 si introuvable
 */
async function remove(req, res) {
    try {
        const result = await MediaService.deleteImage(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = { upload, getOne, remove };