require("dotenv").config();
const sequelize = require("./src/config/database.config");
const { User, Follow } = require("./src/models/user.model");

const ADMIN_ID = "1";
const MOD_ID = "2";
const getUserId = (i) => String(i + 2);

const usersSeed = [
    { id_user: ADMIN_ID, pseudo_uniq: "admin_sys", pseudo: "Admin", bio: "Administrateur système de la plateforme." },
    { id_user: MOD_ID, pseudo_uniq: "mod_sys", pseudo: "Modérateur", bio: "Garant des règles et du bon fonctionnement." }
];

for (let i = 1; i <= 20; i++) {
    usersSeed.push({
        id_user: getUserId(i),
        pseudo_uniq: `user_${i}`,
        pseudo: `Utilisateur ${i}`,
        bio: `Salut ! Je suis l'utilisateur ${i}, passionné par la tech et la bonne humeur.`,
    });
}

async function seedDatabase() {
    try {
        if (process.env.RESET_SEED === "true") {
            await Follow.destroy({ where: {}, truncate: true, cascade: true });
            await User.destroy({ where: {}, truncate: true, cascade: true });
        }

        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        const createdUsers = {};
        for (const userData of usersSeed) {
            const [user] = await User.findOrCreate({
                where: { id_user: userData.id_user },
                defaults: { 
                    ...userData, 
                    img_profile: null, 
                    signalement: 0, 
                    banned_until: null, 
                    nb_followers: 0 
                },
            });
            createdUsers[userData.id_user] = user;
        }

        // Création de quelques relations (suivis)
        const u3 = createdUsers[getUserId(1)];
        const u4 = createdUsers[getUserId(2)];
        const u5 = createdUsers[getUserId(3)];
        if (u3 && u4) await u3.addFollowing(u4);
        if (u4 && u5) await u4.addFollowing(u5);

        console.log(`ok : ${usersSeed.length} profils créés dans le microservice User.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
seedDatabase();