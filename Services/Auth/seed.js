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
    { name: "publish_post", description: "Fx3. Publication de messages et réponses (posts et commentaires)" },
    { name: "view_timeline", description: "Fx5. Flux chronologique — active/désactive la page d'accueil" },
    { name: "like_post", description: "Fx6. Liker un post" },
    { name: "follow_user", description: "Fx9. Suivre ou être suivi" },
    { name: "list_user_posts", description: "Fx11. Liste des messages publiés sur le profil" },
    { name: "list_others_posts", description: "Fx11b. Affichage des posts sous le profil d'autres utilisateurs" },
    { name: "search", description: "Fx13. Recherche de posts (contenu et tags)" },
    { name: "receive_notifications", description: "Fx14. Réception des notifications (mentions, likes, abonnés)" },
    { name: "private_messages", description: "Fx17. Système de messages privés entre utilisateurs" },
    { name: "add_images", description: "Fx18. Ajout d'images aux messages" },
    { name: "add_videos", description: "Fx19. Ajout de vidéos aux messages" },
    { name: "report_content", description: "Fx20. Signalement de contenu inapproprié" },
    { name: "moderate_users", description: "Fx21. Suspension ou bannissement des utilisateurs" },
    { name: "multi_language", description: "Fx22. Interface multi-langues" },
    { name: "custom_theme", description: "Fx23. Thème personnalisé" },
    { name: "manage_roles", description: "Administration des rôles et des permissions" },
];

const rolePermissionsMap = {
    visiteur:       ["create_account", "custom_theme"],
    utilisateur:    ["publish_post", "view_timeline", "like_post", "follow_user", "list_user_posts", "search", "receive_notifications", "private_messages", "add_images", "add_videos", "report_content", "multi_language", "custom_theme"],
    moderateur:     ["publish_post", "view_timeline", "like_post", "follow_user", "list_user_posts", "list_others_posts", "search", "receive_notifications", "private_messages", "add_images", "add_videos", "report_content", "moderate_users", "multi_language", "custom_theme"],
    administrateur: ["create_account", "publish_post", "view_timeline", "like_post", "follow_user", "list_user_posts", "list_others_posts", "search", "receive_notifications", "private_messages", "add_images", "add_videos", "report_content", "moderate_users", "multi_language", "custom_theme", "manage_roles"],
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