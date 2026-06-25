require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./src/config/database.config");
const { User, Role, Permission, RolePermission, initializeAssociations } = require("./src/models");

const ADMIN_ID = "1";
const MOD_ID = "2";

/**
 * Donne l'id du i-ème utilisateur régulier (les ids 1 et 2 sont réservés admin/mod).
 * Entrée : i (number), 1-based
 * Sortie : id (string)
 */
const getUserId = (i) => String(i + 2);
const USER_COUNT = 33;

const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

const permissionsList = [
    { name: "create_account", description: "Fx1. Création de comptes utilisateurs" },
    { name: "publish_post", description: "Fx3. Publication de messages et réponses (posts et commentaires)" },
    { name: "view_feed", description: "Fx5. Flux chronologique — active/désactive la page d'accueil" },
    { name: "like_post", description: "Fx6. Liker un post" },
    { name: "follow_user", description: "Fx9. Suivre ou être suivi" },
    { name: "view_others_posts", description: "Fx11. Affichage des posts sous le profil d'autres utilisateurs (ses propres posts restent toujours visibles)" },
    { name: "search", description: "Fx13. Recherche de posts (contenu et tags)" },
    { name: "receive_notifications", description: "Fx14. Réception des notifications (mentions, likes, abonnés)" },
    { name: "send_messages", description: "Fx17. Système de messages privés entre utilisateurs" },
    { name: "add_images", description: "Fx18. Ajout d'images aux messages" },
    { name: "add_videos", description: "Fx19. Ajout de vidéos aux messages" },
    { name: "report_content", description: "Fx20. Signalement de contenu inapproprié" },
    { name: "moderate_users", description: "Fx21. Suspension ou bannissement des utilisateurs" },
    { name: "change_language", description: "Fx22. Interface multi-langues" },
    { name: "change_theme", description: "Fx23. Thème personnalisé" },
    { name: "manage_roles", description: "Administration des rôles et des permissions" },
];

const rolePermissionsMap = {
    visiteur:       ["create_account", "change_theme"],
    utilisateur:    ["publish_post", "view_feed", "like_post", "follow_user", "search", "receive_notifications", "send_messages", "add_images", "add_videos", "report_content", "change_language", "change_theme"],
    moderateur:     ["publish_post", "view_feed", "like_post", "follow_user", "view_others_posts", "search", "receive_notifications", "send_messages", "add_images", "add_videos", "report_content", "moderate_users", "change_language", "change_theme"],
    administrateur: ["create_account", "publish_post", "view_feed", "like_post", "follow_user", "view_others_posts", "search", "receive_notifications", "send_messages", "add_images", "add_videos", "report_content", "moderate_users", "change_language", "change_theme", "manage_roles"],
};

/**
 * Crée (ou met à jour) les permissions, les rôles et leurs liens, puis les comptes de départ.
 * Le jeu complet (mod + utilisateurs factices) n'est créé qu'avec SEED_DATASET=test.
 * Entrée : rien (lit RESET_SEED et SEED_DATASET dans l'environnement)
 * Sortie : rien (process.exit 0 si succès, 1 sinon)
 */
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
        const usersToCreate = [
            { id: ADMIN_ID, email: "admin@example.com", roleId: createdRoles.administrateur.id },
        ];

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