require("dotenv").config();
const mongoose = require("mongoose");
const { fakerFR: faker } = require("@faker-js/faker");
const connectDB = require("./src/config/database.config");
const Conversation = require("./src/models/conversation.model");
const Message = require("./src/models/message.model");

// --- Constantes partagées (DOIVENT rester synchronisées entre les services Auth/User/Post/Message) ---
const ADMIN_ID = "1";
const MOD_ID = "2";
const getUserId = (i) => String(i + 2);
const USER_COUNT = 33;
const FOLLOW_SEED = 4242; // doit être identique à Services/User/seed.js
const ALL_USER_IDS = [
    ADMIN_ID,
    MOD_ID,
    ...Array.from({ length: USER_COUNT }, (_, i) => getUserId(i + 1)),
];

// "test" => conversations factices ; sinon (prod) => rien.
const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

faker.seed(1234); // résultat reproductible

const messagePool = [
    "Salut, ça va ?",
    "Tu fais quoi ce week-end ?",
    "T'as vu mon dernier post ? 😄",
    "On se capte ce soir ?",
    "Haha trop drôle 😂",
    "Merci beaucoup !",
    "Je t'envoie ça demain",
    "Carrément d'accord 👍",
    "Tu viens à l'event ?",
    "Pas de souci",
    "Je te rappelle plus tard",
    "C'était génial hier soir !",
    "Tiens-moi au courant",
    "À tout de suite",
    "Trop hâte ! 🔥",
];

function makeMessageContent() {
    const base = faker.helpers.arrayElement(messagePool);
    // Parfois on enchaîne deux phrases pour varier le ton.
    if (faker.datatype.boolean(0.25)) {
        const second = faker.helpers.arrayElement(messagePool);
        if (second !== base) return `${base} ${second}`;
    }
    return base;
}

// Graphe de follows : fonction déterministe et AUTONOME (reseed interne).
// Doit rester IDENTIQUE à celle de Services/User/seed.js afin de reconstituer
// exactement les mêmes relations de suivi.
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

// Paires d'abonnés MUTUELS (a suit b ET b suit a) — seul cas où l'app autorise
// d'ouvrir une conversation (cf. front NewConversationModal).
function buildMutualPairs() {
    const pairs = buildFollowPairs(ALL_USER_IDS);
    const directed = new Set(pairs.map((p) => `${p.follower_id}>${p.following_id}`));
    const seen = new Set();
    const mutual = [];
    for (const { follower_id: a, following_id: b } of pairs) {
        if (!directed.has(`${b}>${a}`)) continue;
        const key = [a, b].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        mutual.push([a, b]);
    }
    return mutual;
}

function buildDataset() {
    const conversations = [];
    const messages = [];
    const now = new Date();

    const mutualPairs = buildMutualPairs();
    faker.seed(1234); // re-graine pour un contenu de messages reproductible et indépendant du graphe

    for (const [a, b] of mutualPairs) {
        const convId = new mongoose.Types.ObjectId();
        const nbMessages = faker.number.int({ min: 3, max: 15 });

        // Messages chronologiques, étalés sur ~30 jours.
        let cursor = faker.date.recent({ days: 30 });
        let last = null;
        for (let m = 0; m < nbMessages; m++) {
            const senderId = faker.helpers.arrayElement([a, b]);
            const content = makeMessageContent();
            // Les anciens messages sont lus ; les 2 plus récents peuvent être non lus.
            const isRecent = m >= nbMessages - 2;
            const readAt = isRecent && faker.datatype.boolean(0.5)
                ? null
                : faker.date.between({ from: cursor, to: now });
            messages.push({
                conversationId: convId,
                senderId,
                content,
                readAt,
                createdAt: cursor,
                updatedAt: cursor,
            });
            last = { content, at: cursor };
            cursor = faker.date.between({ from: cursor, to: now });
        }

        conversations.push({
            _id: convId,
            participants: [a, b],
            lastMessage: last ? last.content : null,
            lastMessageAt: last ? last.at : null,
            createdAt: messages.find((msg) => msg.conversationId === convId).createdAt,
            updatedAt: last ? last.at : new Date(),
        });
    }

    return { conversations, messages };
}

async function seedDatabase() {
    try {
        await connectDB();

        if (process.env.RESET_SEED === "true") {
            await Message.deleteMany({});
            await Conversation.deleteMany({});
        }

        if (!IS_TEST_DATASET) {
            console.log("Message : dataset non-test -> aucune conversation factice insérée.");
            process.exit(0);
        }

        const { conversations, messages } = buildDataset();

        await Conversation.insertMany(conversations, { timestamps: false });
        await Message.insertMany(messages, { timestamps: false });

        console.log(
            `ok : ${conversations.length} conversations et ${messages.length} messages créés dans MongoDB.`
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
