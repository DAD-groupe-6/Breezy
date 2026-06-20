require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./src/config/database.config");
const { User, Role, Permission, initializeAssociations } = require("./src/models");

const permissionsList = [
    { name: 'create_account', description: 'Permettre la création de compte' },
    { name: 'authenticate', description: 'Permettre l\'authentification' },
    { name: 'create_post', description: 'Créer une publication' },
    { name: 'view_profile_posts', description: 'Voir les publications d\'un profil' },
    { name: 'view_feed', description: 'Voir le fil d\'actualité' },
    { name: 'like_post', description: 'Aimer une publication' },
    { name: 'comment_post', description: 'Commenter une publication' },
    { name: 'reply_comment', description: 'Répondre à un commentaire' },
    { name: 'follow_user', description: 'Suivre un utilisateur' },
    { name: 'view_basic_profile', description: 'Voir le profil basique' },
    { name: 'list_user_posts', description: 'Lister les publications utilisateur' },
    { name: 'add_tags', description: 'Ajouter des tags' },
    { name: 'search_tags', description: 'Rechercher des tags' },
    { name: 'mention_notifications', description: 'Notifications de mentions' },
    { name: 'like_notifications', description: 'Notifications de likes' },
    { name: 'follower_notifications', description: 'Notifications d\'abonnements' },
    { name: 'private_messaging', description: 'Messages privés' },
    { name: 'add_images', description: 'Ajouter des images' },
    { name: 'add_videos', description: 'Ajouter des vidéos' },
    { name: 'report_content', description: 'Signaler du contenu' },
    { name: 'suspend_user', description: 'Suspendre un utilisateur' },
    { name: 'multilanguage_interface', description: 'Interface multilingue' },
    { name: 'custom_theme', description: 'Thème personnalisé' }
];

const rolePermissionsMap = {
    visitor: [
        'create_account', 'custom_theme'
    ],
    user: [
        'authenticate', 'create_post', 'view_profile_posts', 'view_feed', 
        'like_post', 'comment_post', 'reply_comment', 'follow_user', 
        'view_basic_profile', 'list_user_posts', 'add_tags', 'search_tags', 
        'mention_notifications', 'like_notifications', 'follower_notifications', 
        'private_messaging', 'add_images', 'add_videos', 'report_content', 
        'multilanguage_interface', 'custom_theme'
    ],
    moderator: [
        'authenticate', 'create_post', 'view_profile_posts', 'view_feed', 
        'like_post', 'comment_post', 'reply_comment', 'follow_user', 
        'view_basic_profile', 'list_user_posts', 'add_tags', 'search_tags', 
        'mention_notifications', 'private_messaging', 'add_images', 'add_videos', 
        'report_content', 'suspend_user', 'multilanguage_interface', 'custom_theme'
    ],
    admin: [
        'create_account', 'authenticate', 'create_post', 'view_profile_posts', 
        'view_feed', 'like_post', 'comment_post', 'reply_comment', 'follow_user', 
        'view_basic_profile', 'list_user_posts', 'add_tags', 'search_tags', 
        'mention_notifications', 'like_notifications', 'follower_notifications',
        'private_messaging', 'add_images', 'add_videos', 
        'report_content', 'suspend_user', 'multilanguage_interface', 'custom_theme'
    ]
};

async function seedDatabase() {
    try {
        console.log('\n=== Début du peuplement de la base de données ===\n');

        // 1. Connexion à la base de données
        await sequelize.authenticate();
        console.log('✓ Connexion à la base de données établie');

        // 2. Initialisation des associations
        initializeAssociations();
        console.log('✓ Associations initialisées');

        // 3. Synchronisation de la base de données
        await sequelize.sync({ alter: true });
        console.log('✓ Tables synchronisées');

        // 4. Création des permissions
        console.log('\n--- Création des permissions ---');
        const createdPermissions = {};
        for (const perm of permissionsList) {
            const [permission, created] = await Permission.findOrCreate({
                where: { name: perm.name },
                defaults: { 
                    name: perm.name,
                    description: perm.description
                }
            });
            createdPermissions[perm.name] = permission;
            if (created) {
                console.log(`  ✓ Permission créée: ${perm.name}`);
            } else {
                console.log(`  • Permission existante: ${perm.name}`);
            }
        }
        console.log(`✓ ${permissionsList.length} permissions traitées`);

        // 5. Création des rôles avec permissions
        console.log('\n--- Création des rôles ---');
        const createdRoles = {};

        for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
            const [role, created] = await Role.findOrCreate({
                where: { name: roleName },
                defaults: { 
                    name: roleName,
                    description: `Rôle ${roleName}`
                }
            });

            createdRoles[roleName] = role;

            // Association des permissions au rôle
            const permissionsToAssign = perms.map(pName => createdPermissions[pName]);
            await role.setPermissions(permissionsToAssign);
            
            if (created) {
                console.log(`  ✓ Rôle créé: ${roleName} avec ${perms.length} permissions`);
            } else {
                console.log(`  • Rôle existant: ${roleName} (permissions mises à jour)`);
            }
        }

        // 6. Création de l'utilisateur admin
        console.log('\n--- Création de l\'utilisateur admin ---');
        const adminRole = createdRoles.admin;
        if (adminRole) {
            const hashedPassword = await bcrypt.hash('123456789', 10);
            const [adminUser, created] = await User.findOrCreate({
                where: { email: 'admin@example.com' },
                defaults: {
                    email: 'admin@example.com',
                    passwordHash: hashedPassword,
                    roleId: adminRole.id
                }
            });

            if (created) {
                console.log(`  ✓ Utilisateur admin créé`);
                console.log(`    Email: admin@example.com`);
                console.log(`    Mot de passe: 123456789`);
            } else {
                console.log(`  • Utilisateur admin existant: admin@example.com`);
            }
        }

        console.log('\n=== Peuplement de la base de données réussi ===\n');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Erreur lors du peuplement:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Exécuter le seed
seedDatabase();