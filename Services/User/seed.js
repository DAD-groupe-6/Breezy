require("dotenv").config();
const sequelize = require("./src/config/database.config");
const { User, Follow } = require("./src/models/user.model");

const shouldReset = process.env.RESET_SEED === "true";

const usersSeed = [
    {
        id_user: "user-seed-1",
        pseudo_uniq: "user_seed_1",
        pseudo: "User Seed 1",
        bio: "Compte exemple minimal.",
    },
    {
        id_user: "user-seed-2",
        pseudo_uniq: "user_seed_2",
        pseudo: "User Seed 2",
        bio: "Compte exemple minimal.",
    },
    // TODO: Ajouter d'autres donnees ici
];

async function resetData() {
    if (!shouldReset) {
        return;
    }

    console.log("\n--- Reset des donnees User ---");
    await Follow.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log("✓ Reset User termine");
}

async function seedDatabase() {
    try {
        console.log("\n=== Debut du seed User ===\n");

        await sequelize.authenticate();
        console.log("✓ Connexion a la base de donnees etablie");

        await sequelize.sync({ alter: true });
        console.log("✓ Tables synchronisees");

        await resetData();

        console.log("\n--- Creation des utilisateurs ---");
        const createdUsers = {};

        for (const userData of usersSeed) {
            const [user, created] = await User.findOrCreate({
                where: { id_user: userData.id_user },
                defaults: {
                    ...userData,
                    img_profile: null,
                    signalement: 0,
                    banned_until: null,
                    nb_followers: 0,
                },
            });

            createdUsers[userData.id_user] = user;
            console.log(
                created
                    ? `  ✓ Utilisateur cree: ${userData.id_user}`
                    : `  • Utilisateur existant: ${userData.id_user}`
            );
        }

        console.log("\n--- Creation des relations Follow ---");
        const follower = createdUsers["user-seed-1"];
        const following = createdUsers["user-seed-2"];

        if (follower && following) {
            const alreadyFollowing = await follower.hasFollowing(following);
            if (!alreadyFollowing) {
                await follower.addFollowing(following);
                console.log("  ✓ Relation follow creee: user-seed-1 -> user-seed-2");
            } else {
                console.log("  • Relation follow existante: user-seed-1 -> user-seed-2");
            }
        }

        console.log("\n=== Seed User termine ===\n");
        process.exit(0);
    } catch (error) {
        console.error("\n✗ Erreur lors du seed User:", error.message);
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();
