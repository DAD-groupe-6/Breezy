require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./src/config/database.config");
const { User, Role, Permission, RolePermission, initializeAssociations } = require("./src/models");

// --- Constantes partagées (DOIVENT rester synchronisées entre les services Auth/User/Post/Message) ---
const ADMIN_ID = "1";
const MOD_ID = "2";
const getUserId = (i) => String(i + 2);
const USER_COUNT = 33; // utilisateurs "réguliers" -> ids "3".."35"

// "test" => jeu de données complet (mod + utilisateurs factices) ; sinon (prod) => admin seul.
const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

const permissionsList = [
    { name: "create_account", description: "Fx1. Création de comptes utilisateurs" },
    { name: "authenticate", description: "Fx2. Authentification sécurisée" },
    { name: "publish_post", description: "Fx3. Publication de messages courts" },
    { name: "view_profile_posts", description: "Fx4. Affichage des messages sur le profil" },
    { name: "view_timeline", description: "Fx5. Flux chronologique des messages" },
    { name: "like_post", description: "Fx6. Liker un post" },
    { name: "reply_post", description: "Fx7. Répondre à un post sous forme de commentaire" },
    { name: "reply_comment", description: "Fx8. Répondre à un commentaire sur un post" },
    { name: "follow_user", description: "Fx9. Suivre ou être suivi" },
    { name: "view_profile", description: "Fx10. Profil utilisateur avec informations de base" },
    { name: "list_user_posts", description: "Fx11. Liste des messages publiés sur le profil" },
    { name: "add_tags", description: "Fx12. Ajout de tags aux messages" },
    { name: "search_tags", description: "Fx13. Recherche de posts via des tags" },
    { name: "report_content", description: "Fx20. Signalement de contenu inapproprié" },
    { name: "moderate_users", description: "Fx21. Suspension ou bannissement des utilisateurs" },
];

const rolePermissionsMap = {
    visiteur:       ["create_account"],
    utilisateur:    ["authenticate", "publish_post", "view_profile_posts", "view_timeline", "like_post", "reply_post", "reply_comment", "follow_user", "view_profile", "list_user_posts", "add_tags", "search_tags", "report_content"],
    moderateur:     ["authenticate", "publish_post", "view_profile_posts", "view_timeline", "like_post", "reply_post", "reply_comment", "follow_user", "view_profile", "list_user_posts", "add_tags", "search_tags", "report_content", "moderate_users"],
    administrateur: ["create_account", "authenticate", "publish_post", "view_profile_posts", "view_timeline", "like_post", "reply_post", "reply_comment", "follow_user", "view_profile", "list_user_posts", "add_tags", "search_tags", "report_content", "moderate_users"],
};

async function seedDatabase() {
    try {
        if (process.env.RESET_SEED === "true") {
            await RolePermission.destroy({ where: {}, truncate: true, cascade: true });
            await User.destroy({ where: {}, truncate: true, cascade: true });
            await Role.destroy({ where: {}, truncate: true, cascade: true });
            await Permission.destroy({ where: {}, truncate: true, cascade: true });
        }

        await sequelize.authenticate();
        initializeAssociations();
        await sequelize.sync({ alter: true });

        const createdPermissions = {};
        for (const perm of permissionsList) {
            const [permission] = await Permission.findOrCreate({ where: { name: perm.name }, defaults: perm });
            createdPermissions[perm.name] = permission;
        }

        const createdRoles = {};
        for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
            const [role] = await Role.findOrCreate({ where: { name: roleName }, defaults: { name: roleName, description: `Rôle ${roleName}` } });
            createdRoles[roleName] = role;
            await role.setPermissions(perms.map((pName) => createdPermissions[pName]));
        }

        const hashedPassword = await bcrypt.hash("123456789", 10);
        // Le compte admin est toujours créé (test ET prod).
        const usersToCreate = [
            { id: ADMIN_ID, email: "admin@example.com", roleId: createdRoles.administrateur.id },
        ];

        // Données factices (mod + utilisateurs) uniquement en environnement de test.
        if (IS_TEST_DATASET) {
            usersToCreate.push({ id: MOD_ID, email: "mod@example.com", roleId: createdRoles.moderateur.id });
            for (let i = 1; i <= USER_COUNT; i++) {
                usersToCreate.push({ id: getUserId(i), email: `user${i}@example.com`, roleId: createdRoles.utilisateur.id });
            }
        }

        for (const u of usersToCreate) {
            await User.findOrCreate({
                where: { email: u.email },
                defaults: { id: u.id, email: u.email, passwordHash: hashedPassword, roleId: u.roleId },
            });
        }

        await sequelize.query(
            `SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX(id) FROM "users"), 1), (SELECT COUNT(*) > 0 FROM "users"))`
        );

        console.log("\n=== COMPTES CRÉÉS ===");
        console.log(`Dataset : ${IS_TEST_DATASET ? "test (complet)" : "prod (admin seul)"}`);
        console.log("Mot de passe unique : 123456789");
        console.log(`Admin (ID: ${ADMIN_ID}): admin@example.com`);
        if (IS_TEST_DATASET) {
            console.log(`Modo (ID: ${MOD_ID}): mod@example.com`);
            console.log(`Users (ID: 3 à ${getUserId(USER_COUNT)}): user1@example.com à user${USER_COUNT}@example.com`);
        }
        console.log("=====================\n");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
seedDatabase();