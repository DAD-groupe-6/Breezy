require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database.config");
const Post = require("./src/models/post.model");

const getUserId = (i) => String(i + 2);

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
];

async function seedDatabase() {
    try {
        await connectDB();
        if (process.env.RESET_SEED === "true") {
            await Post.deleteMany({});
        }

        const postsToInsert = [];
        let postIndex = 0;

        // 20 utilisateurs * 10 posts (ID de 3 à 22)
        for (let i = 1; i <= 20; i++) {
            for (let j = 1; j <= 10; j++) {
                const content = realPosts[postIndex % realPosts.length];
                
                postsToInsert.push({
                    id_user: getUserId(i),
                    type: "post",
                    content: content,
                    image: null,
                    likes: [],
                    nb_signalement: 0,
                    reporters: [],
                    list_tags: content.includes("#") ? [content.split("#")[1].split(" ")[0].toLowerCase()] : ["humeur"],
                    commentsCount: 0,
                    parent_id: null,
                    reply_to: null,
                });
                postIndex++;
            }
        }

        await Post.insertMany(postsToInsert);
        console.log(`ok : 200 posts réalistes créés dans MongoDB (10 par utilisateur).`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}
seedDatabase();