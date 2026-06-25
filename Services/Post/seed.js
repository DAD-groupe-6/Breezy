require("dotenv").config();
const mongoose = require("mongoose");
const { fakerFR: faker } = require("@faker-js/faker");
const connectDB = require("./src/config/database.config");
const Post = require("./src/models/post.model");
const Like = require("./src/models/like.model");
const { extractTags } = require("./src/utils/tags.util");

const ADMIN_ID = "1";
const MOD_ID = "2";

/**
 * Donne l'id du i-ème utilisateur régulier (1 et 2 sont réservés admin/mod).
 * Entrée : i (number), 1-based
 * Sortie : id (string)
 */
const getUserId = (i) => String(i + 2);
const USER_COUNT = 33;
const ALL_USER_IDS = [
    ADMIN_ID,
    MOD_ID,
    ...Array.from({ length: USER_COUNT }, (_, i) => getUserId(i + 1)),
];

const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

/**
 * Construit un ObjectId déterministe (24 caractères) à partir d'un entier.
 * Entrée : n (number)
 * Sortie : id (string)
 */
const objId = (n) => String(n).padStart(24, "0");
const POST_IMAGE_IDS = Array.from({ length: 30 }, (_, i) => objId(101 + i));
const POST_VIDEO_IDS = Array.from({ length: 6 }, (_, i) => objId(201 + i));

/**
 * Construit l'URL publique d'un média à partir de son id.
 * Entrée : id (string)
 * Sortie : url (string)
 */
const mediaUrl = (id) => `/api/v1/media/${id}`;

faker.seed(1234);

const realPosts = [
    "Aujourd'hui est une journée parfaite pour apprendre de nouvelles choses ! 🚀",
    "Je n'arrive pas à y croire, le dernier épisode était juste fou... 🎬 #NoSpoil",
    "Est-ce que quelqu'un a une bonne recommandation de livre ? 📚",
    "Le café est mon seul moteur ce matin. ☕😴",
    "C'est quand même incroyable l'évolution de l'IA ces dernières années. 🤖 #Tech",
    "Petite pause bien méritée après une longue journée de travail. 🛋️",
    "Qui est chaud pour un jeu en ligne ce soir ? 🎮",
    "J'ai enfin réussi à corriger ce bug qui me prenait la tête depuis 3 jours ! 💻🎉 #Dev",
    "La recette de ce soir : pâtes à la carbonara (les vraies, sans crème) ! 🍝",
    "Il fait un temps magnifique, profitez bien du soleil ! ☀️",
    "Je viens de découvrir un groupe incroyable, je passe leurs sons en boucle 🎧",
    "Le match de ce soir s'annonce épique ! ⚽🔥",
    "Rien ne vaut une bonne balade en pleine nature pour se ressourcer. 🌲",
    "Quelqu'un sait comment on centre une div en CSS ? C'est pour un ami... 😅 #webdev",
    "Mon chat me juge pendant que je travaille, comme d'habitude. 🐈‍⬛",
    "Les bouchons ce matin... on en parle ? 🚗😤",
    "Je crois que j'ai une nouvelle addiction : le pain au chocolat (ou chocolatine). 🥐",
    "Vivement le week-end, cette semaine m'a épuisé. 💤",
    "Très belle découverte de ce petit resto en centre-ville, je recommande ! 🍔",
    "Toujours vérifier que son micro est coupé pendant une réunion en visio... oups. 🤐",
    "Premier semi-marathon terminé, les jambes en compote mais tellement fier ! 🏃 #Sport",
    "On sous-estime trop le pouvoir d'une bonne nuit de sommeil. 😴",
    "Je me lance enfin dans l'apprentissage de la guitare 🎸 des conseils ?",
    "Le télétravail a vraiment changé mon rapport au temps. 🏡",
    "Petit potager sur le balcon : les tomates commencent à pousser ! 🍅🌱",
    "Franchement ce film est surcoté, je comprends pas le hype. 🍿",
    "Journée musée aujourd'hui, ça fait du bien à la tête. 🖼️",
    "Mise à jour de l'app déployée en prod sans accroc 🚀 #Dev",
    "Quelqu'un a déjà testé le jeûne intermittent ? Retours bienvenus.",
    "Rien de tel qu'un thé chaud et un bon bouquin quand il pleut. 🌧️📖",
    "Les transports en commun ce soir c'était l'aventure... 🚇",
    "Nouveau record perso à la salle aujourd'hui 💪 #Muscu",
    "J'ai enfin trié mes mails : inbox zero atteinte ! 📩✨",
    "Le printemps arrive, les terrasses se remplissent. ☕🌸",
    "On fait un blind test ce week-end, qui est partant ? 🎵",
    "Petit rappel : pensez à boire de l'eau aujourd'hui. 💧",
    "Mon code marchait hier, je n'ai rien touché, et aujourd'hui plus rien. 🙃 #Dev",
    "Soirée pizza maison réussie 🍕 la pâte était parfaite cette fois.",
    "Coucher de soleil incroyable ce soir, la nature fait bien les choses. 🌅",
    "Je crois que je suis officiellement accro aux podcasts. 🎙️",
    "Grand ménage de printemps terminé, je respire mieux dans cet appart. 🧹",
    "Première gelée maison, fière du résultat 🍓",
    "Qui d'autre relit toujours ses messages 3 fois avant d'envoyer ? 😅",
    "Le nouveau café du quartier est une pépite ☕ #FoodLover",
    "Session révision intense, mais on lâche rien 📚💪",
    "Petite victoire du jour : j'ai réussi mon créneau du premier coup. 🚗🎉",
    "La pluie, un plaid, une série : programme parfait. 🌧️📺",
    "Je redécouvre le plaisir d'écrire à la main. ✍️",
    "On part en rando ce week-end, hâte de déconnecter. ⛰️",
    "Mon plante verte a survécu un mois entier, c'est un miracle 🌿",
    "Rien ne bat l'odeur du pain frais le matin. 🥖",
    "Concert hier soir : ambiance de folie 🎶🔥",
    "Je teste une nouvelle organisation de mes journées, on verra bien. 🗓️",
    "Petit défi : zéro écran après 22h cette semaine. 📵",
    "La technologie c'est génial, jusqu'à ce que l'imprimante s'en mêle. 🖨️😤",
    "Marché du dimanche = panier rempli de bons produits frais. 🥕🍎",
    "J'ai (enfin) compris les promesses en JavaScript 😮‍💨 #webdev",
    "Le silence du matin avant que tout le monde se réveille, c'est précieux. 🌄",
    "Nouveau jeu installé, je vous raconte pas ma nuit. 🎮😴",
    "Gratitude du jour : un café, un ami, un fou rire. ☕❤️",
];

const commentPool = [
    "Totalement d'accord ! 👍",
    "Haha excellent 😂",
    "Merci du partage 🙏",
    "Pas faux...",
    "Je suis pas convaincu 🤔",
    "C'est exactement ça !",
    "Trop bien 😍",
    "Mdr",
    "Courage 💪",
    "Intéressant, t'as une source ?",
    "+1",
    "Bien vu 👌",
    "Ça me parle 😅",
    "Première fois que je vois ça",
    "Énorme 🔥",
    "On en reparle 😉",
    "Franchement respect",
    "Je note, merci !",
    "Pareil pour moi",
    "Tu m'étonnes 😄",
];

const tagPool = ["humeur", "tech", "food", "sport", "cinema", "musique", "dev", "voyage", "nature", "lifestyle"];

/**
 * Compose le contenu d'un post à partir du pool curé (combinaisons et hashtags aléatoires).
 * Entrée : rien
 * Sortie : content (string)
 */
function makePostContent() {
    const base = faker.helpers.arrayElement(realPosts);
    if (faker.datatype.boolean(0.2)) {
        const second = faker.helpers.arrayElement(realPosts);
        if (second !== base) return `${base} ${second}`;
    }
    if (faker.datatype.boolean(0.25) && !base.includes("#")) {
        return `${base} #${faker.helpers.arrayElement(tagPool)}`;
    }
    return base;
}

/**
 * Tire au sort les médias d'un post (~20 % images, ~5 % vidéo, ~75 % texte seul).
 * Entrée : rien
 * Sortie : media (object) { images (array), video (string|null) }
 */
function pickMedia() {
    const r = faker.number.float();
    if (r < 0.2) {
        const n = faker.number.int({ min: 1, max: 4 });
        return { images: faker.helpers.arrayElements(POST_IMAGE_IDS, n).map(mediaUrl), video: null };
    }
    if (r < 0.25) {
        return { images: [], video: mediaUrl(faker.helpers.arrayElement(POST_VIDEO_IDS)) };
    }
    return { images: [], video: null };
}

/**
 * Construit un document Post complet à partir de champs partiels (valeurs par défaut + _id).
 * Entrée : fields (object), doit inclure createdAt
 * Sortie : doc (object) prêt pour l'insertion
 */
function newDoc(fields) {
    const now = fields.createdAt;
    return {
        _id: new mongoose.Types.ObjectId(),
        images: [],
        video: null,
        nb_like: 0,
        nb_signalement: 0,
        reporters: [],
        commentsCount: 0,
        parent_id: null,
        reply_to: null,
        createdAt: now,
        updatedAt: now,
        ...fields,
    };
}

/**
 * Génère en mémoire le jeu de données complet : posts racines, commentaires/réponses, likes
 * et quelques signalements, de façon déterministe.
 * Entrée : rien
 * Sortie : dataset (object) { posts, comments, likes }
 */
function buildDataset() {
    const posts = [];
    const comments = [];
    const likes = [];

    for (const userId of ALL_USER_IDS) {
        const count = faker.number.int({ min: 8, max: 25 });
        for (let p = 0; p < count; p++) {
            const content = makePostContent();
            const media = pickMedia();
            posts.push(
                newDoc({
                    id_user: userId,
                    type: "post",
                    content,
                    images: media.images,
                    video: media.video,
                    list_tags: extractTags(content),
                    createdAt: faker.date.recent({ days: 60 }),
                })
            );
        }
    }

    const now = new Date();

    for (const post of posts) {
        if (!faker.datatype.boolean(0.45)) continue;
        const nbComments = faker.number.int({ min: 1, max: 5 });
        const postComments = [];

        for (let c = 0; c < nbComments; c++) {
            const content = faker.helpers.arrayElement(commentPool);
            const comment = newDoc({
                id_user: faker.helpers.arrayElement(ALL_USER_IDS),
                type: "response",
                content,
                list_tags: extractTags(content),
                parent_id: post._id,
                reply_to: null,
                createdAt: faker.date.between({ from: post.createdAt, to: now }),
            });
            comments.push(comment);
            postComments.push(comment);

            if (faker.datatype.boolean(0.3)) {
                const nbReplies = faker.number.int({ min: 1, max: 3 });
                for (let r = 0; r < nbReplies; r++) {
                    const rContent = faker.helpers.arrayElement(commentPool);
                    comments.push(
                        newDoc({
                            id_user: faker.helpers.arrayElement(ALL_USER_IDS),
                            type: "response",
                            content: rContent,
                            list_tags: extractTags(rContent),
                            parent_id: comment._id,
                            reply_to: comment._id,
                            createdAt: faker.date.between({ from: comment.createdAt, to: now }),
                        })
                    );
                }
                comment.commentsCount = nbReplies;
            }
        }
        post.commentsCount = postComments.length;
    }

    const addLikes = (doc, maxLikes) => {
        const candidates = ALL_USER_IDS.filter((id) => id !== doc.id_user);
        const count = faker.number.int({ min: 0, max: Math.min(maxLikes, candidates.length) });
        const likers = faker.helpers.arrayElements(candidates, count);
        for (const userId of likers) {
            likes.push({ post_id: doc._id, user_id: userId });
        }
        doc.nb_like = likers.length;
    };
    posts.forEach((post) => addLikes(post, 25));
    comments.forEach((comment) => addLikes(comment, 8));

    for (const post of posts) {
        if (!faker.datatype.boolean(0.05)) continue;
        const candidates = ALL_USER_IDS.filter((id) => id !== post.id_user);
        const reporters = faker.helpers.arrayElements(candidates, faker.number.int({ min: 1, max: 2 }));
        post.reporters = reporters;
        post.nb_signalement = reporters.length;
    }

    return { posts, comments, likes };
}

/**
 * Insère le jeu de données de test dans MongoDB (rien en dataset non-test).
 * Entrée : rien (lit RESET_SEED et SEED_DATASET dans l'environnement)
 * Sortie : rien (process.exit 0 si succès, 1 sinon)
 */
async function seedDatabase() {
    try {
        await connectDB();

        if (process.env.RESET_SEED === "true") {
            await Post.deleteMany({});
            await Like.deleteMany({});
        }

        if (!IS_TEST_DATASET) {
            console.log("Post : dataset non-test -> aucun post factice inséré.");
            process.exit(0);
        }

        const { posts, comments, likes } = buildDataset();

        await Post.insertMany([...posts, ...comments], { timestamps: false });
        await Like.insertMany(likes);

        console.log(
            `ok : ${posts.length} posts, ${comments.length} commentaires/réponses et ${likes.length} likes créés dans MongoDB.`
        );
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}
seedDatabase();
