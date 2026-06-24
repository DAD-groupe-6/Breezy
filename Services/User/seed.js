require("dotenv").config();
const { fakerFR: faker } = require("@faker-js/faker");
const sequelize = require("./src/config/database.config");
const { User, Follow } = require("./src/models/user.model");

// --- Constantes partagées (DOIVENT rester synchronisées entre les services Auth/User/Post/Message) ---
const ADMIN_ID = "1";
const MOD_ID = "2";
const getUserId = (i) => String(i + 2);
const USER_COUNT = 33; // utilisateurs "réguliers" -> ids "3".."35"
const FOLLOW_SEED = 4242; // graine dédiée au graphe de follows (reproductible côté User ET Message)

// "test" => jeu de données complet ; sinon (prod) => profil admin seul.
const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

// --- Identifiants média FIXES (synchronisés avec Services/Media/seed.js et Services/Post/seed.js) ---
const objId = (n) => String(n).padStart(24, "0");
const AVATAR_IDS = Array.from({ length: 12 }, (_, i) => objId(1 + i));
const mediaUrl = (id) => `/api/v1/media/${id}`;

faker.seed(1234); // résultat reproductible

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
            pseudo_uniq: `user${i}`, // identifiant unique stable (login/recherche)
            pseudo: faker.person.fullName(), // nom affiché varié
            bio: faker.helpers.arrayElement(bioPool),
            // Médias "souvent mais pas tout le temps" : ~70 % ont une photo de profil.
            img_profile: faker.datatype.boolean(0.7)
                ? mediaUrl(faker.helpers.arrayElement(AVATAR_IDS))
                : null,
        });
    }

    // --- Modération (pour tester le back-office) ---
    const byId = Object.fromEntries(profiles.map((p) => [p.id_user, p]));
    byId[getUserId(5)].signalement = 2;
    byId[getUserId(10)].signalement = 1;
    byId[getUserId(USER_COUNT - 1)].banned_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // banni 30 j
    byId[getUserId(USER_COUNT)].banned_until = new Date("9999-12-31T00:00:00Z"); // banni "permanent"

    return profiles;
}

// Graphe de follows : chaque utilisateur suit 5 à 15 autres (sans self-follow ni doublon).
// IMPORTANT : fonction déterministe et AUTONOME (reseed interne). Doit rester
// IDENTIQUE à celle de Services/Message/seed.js pour que la messagerie connaisse
// les mêmes relations de suivi (conversations entre abonnés mutuels uniquement).
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

async function seedDatabase() {
    try {
        if (process.env.RESET_SEED === "true") {
            await Follow.destroy({ where: {}, truncate: true, cascade: true });
            await User.destroy({ where: {}, truncate: true, cascade: true });
        }

        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        // En prod : uniquement le profil admin, aucune donnée factice.
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

        // nb_followers cohérent = nombre de fois où l'utilisateur est "following".
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
