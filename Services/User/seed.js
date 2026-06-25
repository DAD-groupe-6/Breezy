require("dotenv").config();
const { fakerFR: faker } = require("@faker-js/faker");
const sequelize = require("./src/config/database.config");
const { User, Follow } = require("./src/models/user.model");

const ADMIN_ID = "1";
const MOD_ID = "2";

/**
 * Donne l'id du i-ème utilisateur régulier (1 et 2 sont réservés admin/mod).
 * Entrée : i (number), 1-based
 * Sortie : id (string)
 */
const getUserId = (i) => String(i + 2);
const USER_COUNT = 33;
const FOLLOW_SEED = 4242;

const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

/**
 * Construit un ObjectId déterministe (24 caractères) à partir d'un entier.
 * Entrée : n (number)
 * Sortie : id (string)
 */
const objId = (n) => String(n).padStart(24, "0");
const AVATAR_IDS = Array.from({ length: 12 }, (_, i) => objId(1 + i));

/**
 * Construit l'URL publique d'un média à partir de son id.
 * Entrée : id (string)
 * Sortie : url (string)
 */
const mediaUrl = (id) => `/api/v1/media/${id}`;

faker.seed(1234);

const bioPool = [
    "Passionné(e) de tech et de bonne humeur. 🙂",
    "Amateur de café, de code et de longues balades. ☕",
    "Toujours partant(e) pour une nouvelle aventure. ✈️",
    "Je poste surtout des trucs random et des memes. 😄",
    "Développeur(se) le jour, gamer la nuit. 🎮",
    "Fan de cuisine, de musique et de chats. 🐱",
    "Ici pour suivre l'actu et papoter. 💬",
    "Sportif(ve) du dimanche, mangeur(se) de pizza tous les jours. 🍕",
    "Curieux(se) de nature, j'apprends un truc nouveau chaque jour. 📚",
    "Photographe amateur et grand(e) rêveur(se). 📷",
    "Minimaliste dans la vie, bavard(e) sur Breezy. 🌿",
    "On refait le monde un post à la fois. 🌍",
];

const adminProfile = {
    id_user: ADMIN_ID,
    pseudo_uniq: "admin_sys",
    pseudo: "Admin",
    bio: "Administrateur système de la plateforme.",
    img_profile: mediaUrl(AVATAR_IDS[0]),
};

/**
 * Construit la liste des profils de test (admin, mod, et USER_COUNT utilisateurs factices),
 * avec quelques cas de modération préremplis.
 * Entrée : rien
 * Sortie : profiles (array de profils)
 */
function buildTestProfiles() {
    const profiles = [
        adminProfile,
        {
            id_user: MOD_ID,
            pseudo_uniq: "mod_sys",
            pseudo: "Modérateur",
            bio: "Garant des règles et du bon fonctionnement.",
            img_profile: mediaUrl(AVATAR_IDS[1]),
        },
    ];

    for (let i = 1; i <= USER_COUNT; i++) {
        profiles.push({
            id_user: getUserId(i),
            pseudo_uniq: `user${i}`,
            pseudo: faker.person.fullName(),
            bio: faker.helpers.arrayElement(bioPool),
            img_profile: faker.datatype.boolean(0.7)
                ? mediaUrl(faker.helpers.arrayElement(AVATAR_IDS))
                : null,
        });
    }

    const byId = Object.fromEntries(profiles.map((p) => [p.id_user, p]));
    byId[getUserId(5)].signalement = 2;
    byId[getUserId(10)].signalement = 1;
    byId[getUserId(USER_COUNT - 1)].banned_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    byId[getUserId(USER_COUNT)].banned_until = new Date("9999-12-31T00:00:00Z");

    return profiles;
}

/**
 * Génère le graphe de follows : chaque utilisateur suit 5 à 15 autres (sans self-follow ni doublon).
 * Déterministe et autonome (reseed interne) ; doit rester identique à Services/Message/seed.js.
 * Entrée : ids (array de string)
 * Sortie : pairs (array) [{ follower_id, following_id }]
 */
function buildFollowPairs(ids) {
    faker.seed(FOLLOW_SEED);
    const pairs = [];
    for (const follower of ids) {
        const candidates = ids.filter((id) => id !== follower);
        const k = Math.min(faker.number.int({ min: 5, max: 15 }), candidates.length);
        const targets = faker.helpers.arrayElements(candidates, k);
        for (const following of targets) {
            pairs.push({ follower_id: follower, following_id: following });
        }
    }
    return pairs;
}

/**
 * Crée les profils et le graphe de follows. En prod (dataset non-test), ne crée que le profil admin.
 * Entrée : rien (lit RESET_SEED et SEED_DATASET dans l'environnement)
 * Sortie : rien (process.exit 0 si succès, 1 sinon)
 */
async function seedDatabase() {
    try {
        if (process.env.RESET_SEED === "true") {
            await Follow.destroy({ where: {}, truncate: true, cascade: true });
            await User.destroy({ where: {}, truncate: true, cascade: true });
        }

        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        if (!IS_TEST_DATASET) {
            await User.findOrCreate({
                where: { id_user: adminProfile.id_user },
                defaults: { ...adminProfile, signalement: 0, banned_until: null, nb_followers: 0 },
            });
            console.log("ok : profil admin créé (dataset prod, sans données factices).");
            process.exit(0);
        }

        const profiles = buildTestProfiles();
        const ids = profiles.map((p) => p.id_user);
        const followPairs = buildFollowPairs(ids);

        const followersCount = {};
        for (const { following_id } of followPairs) {
            followersCount[following_id] = (followersCount[following_id] || 0) + 1;
        }

        for (const p of profiles) {
            await User.findOrCreate({
                where: { id_user: p.id_user },
                defaults: {
                    id_user: p.id_user,
                    pseudo_uniq: p.pseudo_uniq,
                    pseudo: p.pseudo,
                    bio: p.bio,
                    img_profile: p.img_profile ?? null,
                    signalement: p.signalement ?? 0,
                    banned_until: p.banned_until ?? null,
                    nb_followers: followersCount[p.id_user] || 0,
                },
            });
        }

        await Follow.bulkCreate(followPairs, { ignoreDuplicates: true });

        console.log(
            `ok : ${profiles.length} profils + ${followPairs.length} relations de suivi créés dans le microservice User.`
        );
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
seedDatabase();
