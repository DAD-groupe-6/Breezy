require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { connectDB, getBucket } = require("./src/config/database.config");

/**
 * Construit un ObjectId déterministe (24 caractères) à partir d'un entier.
 * Entrée : n (number)
 * Sortie : id (string)
 */
const objId = (n) => String(n).padStart(24, "0");
const AVATAR_IDS = Array.from({ length: 12 }, (_, i) => objId(1 + i));
const POST_IMAGE_IDS = Array.from({ length: 30 }, (_, i) => objId(101 + i));
const POST_VIDEO_IDS = Array.from({ length: 6 }, (_, i) => objId(201 + i));

const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

const ASSETS_DIR = path.join(__dirname, "seed-assets");
const groups = [
    { dir: "avatars", ids: AVATAR_IDS, contentType: "image/jpeg" },
    { dir: "images", ids: POST_IMAGE_IDS, contentType: "image/jpeg" },
    { dir: "videos", ids: POST_VIDEO_IDS, contentType: "video/mp4" },
];

/**
 * Liste les fichiers d'un dossier d'assets, triés par ordre numérique.
 * Entrée : dir (string), nom du sous-dossier
 * Sortie : files (array de string), chemins complets
 */
function listAssetFiles(dir) {
    const full = path.join(ASSETS_DIR, dir);
    return fs
        .readdirSync(full)
        .filter((f) => !f.startsWith("."))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
        .map((f) => path.join(full, f));
}

/**
 * Supprime un fichier s'il existe, en ignorant l'absence (rend le seed idempotent).
 * Entrée : bucket (GridFSBucket), id (string)
 * Sortie : rien
 */
async function deleteIfExists(bucket, id) {
    try {
        await bucket.delete(new mongoose.Types.ObjectId(id));
    } catch (e) {
    }
}

/**
 * Écrit un fichier dans GridFS avec un _id imposé.
 * Entrée : bucket (GridFSBucket), id (string), filePath (string), contentType (string)
 * Sortie : Promise résolue à la fin de l'écriture
 */
function uploadOne(bucket, id, filePath, contentType) {
    return new Promise((resolve, reject) => {
        const upload = bucket.openUploadStreamWithId(
            new mongoose.Types.ObjectId(id),
            path.basename(filePath),
            { contentType }
        );
        fs.createReadStream(filePath)
            .on("error", reject)
            .pipe(upload)
            .on("error", reject)
            .on("finish", resolve);
    });
}

/**
 * Charge les médias de démonstration dans GridFS (uniquement si SEED_DATASET=test),
 * en delete-then-upload pour rester idempotent.
 * Entrée : rien
 * Sortie : rien (process.exit 0 si succès, 1 sinon)
 */
async function seedDatabase() {
    try {
        await connectDB();

        if (!IS_TEST_DATASET) {
            console.log("Media : dataset non-test -> aucun média factice inséré.");
            process.exit(0);
        }

        const bucket = getBucket();
        let total = 0;

        for (const group of groups) {
            const files = listAssetFiles(group.dir);
            if (files.length !== group.ids.length) {
                throw new Error(
                    `seed-assets/${group.dir} contient ${files.length} fichier(s) mais ${group.ids.length} id(s) sont attendus. ` +
                    `Synchronise les compteurs de média entre Media/Post/User.`
                );
            }
            for (let i = 0; i < files.length; i++) {
                await deleteIfExists(bucket, group.ids[i]);
                await uploadOne(bucket, group.ids[i], files[i], group.contentType);
                total++;
            }
        }

        console.log(`ok : ${total} médias chargés dans GridFS (db-media).`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedDatabase();
