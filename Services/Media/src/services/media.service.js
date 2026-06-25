const mongoose = require("mongoose");
const { getBucket } = require("../config/database.config");

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
];


/**
 * Ouvre un flux d'écriture GridFS pour stocker un fichier.
 * Entrée : filename (string), contentType (string)
 * Sortie : uploadStream (GridFSBucketWriteStream)
 */
function openUploadStream(filename, contentType) {
    return getBucket().openUploadStream(filename, { contentType });
}

/**
 * Récupère les métadonnées d'un fichier (taille, type...).
 * Entrée : id (string)
 * Sortie : file (object) ; throw "Invalid id" / "File not found"
 */
async function getFileInfo(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid id");
    }
    const bucket = getBucket();
    const files = await bucket
        .find({ _id: new mongoose.Types.ObjectId(id) })
        .toArray();

    if (!files || files.length === 0) {
        throw new Error("File not found");
    }
    return files[0];
}


/**
 * Ouvre un flux de lecture GridFS (options start/end pour le streaming par plage).
 * Entrée : id (string), options (object, optionnel) { start, end }
 * Sortie : readStream (GridFSBucketReadStream)
 */
function getReadStream(id, options = {}) {
    const bucket = getBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(id), options);
}

/**
 * Supprime un fichier de GridFS.
 * Entrée : id (string)
 * Sortie : result (object) { id } ; throw "Invalid id"
 */
async function deleteImage(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid id");
    }
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(id));
    return { id };
}

module.exports = {
    ALLOWED_TYPES,
    openUploadStream,
    getFileInfo,
    getReadStream,
    deleteImage,
};
