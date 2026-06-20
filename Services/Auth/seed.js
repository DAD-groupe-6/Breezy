require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./src/config/database.config");
const {
    User,
    Role,
    Permission,
    RolePermission,
    initializeAssociations,
} = require("./src/models");

const permissionsList = [
    { name: "create_account", description: "Permettre la création de compte" },
    { name: "authenticate", description: "Permettre l'authentification" },
    // TODO: Ajouter d'autres données ici
];

const rolePermissionsMap = {
    admin: ["create_account", "authenticate"],
    // TODO: Ajouter d'autres données ici
};

const shouldReset = process.env.RESET_SEED === "true";

async function resetData() {
    if (!shouldReset) {
        return;
    }

    console.log("\n--- Reset des données Auth ---");
    await RolePermission.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    await Role.destroy({ where: {}, truncate: true, cascade: true });
    await Permission.destroy({ where: {}, truncate: true, cascade: true });
    console.log("✓ Reset Auth terminé");
}

async function seedDatabase() {
    try {
        console.log("\n=== Début du seed Auth ===\n");

        await sequelize.authenticate();
        console.log("✓ Connexion à la base de données établie");

        initializeAssociations();
        console.log("✓ Associations initialisées");

        await sequelize.sync({ alter: true });
        console.log("✓ Tables synchronisées");

        await resetData();

        console.log("\n--- Création des permissions ---");
        const createdPermissions = {};
        for (const perm of permissionsList) {
            const [permission, created] = await Permission.findOrCreate({
                where: { name: perm.name },
                defaults: {
                    name: perm.name,
                    description: perm.description,
                },
            });
            createdPermissions[perm.name] = permission;
            if (created) {
                console.log(`  ✓ Permission créée: ${perm.name}`);
            } else {
                console.log(`  • Permission existante: ${perm.name}`);
            }
        }
        console.log(`✓ ${permissionsList.length} permissions traitées`);

        console.log("\n--- Création des rôles ---");
        const createdRoles = {};

        for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
            const [role, created] = await Role.findOrCreate({
                where: { name: roleName },
                defaults: {
                    name: roleName,
                    description: `Rôle ${roleName}`,
                },
            });

            createdRoles[roleName] = role;

            const permissionsToAssign = perms.map((pName) => createdPermissions[pName]);
            await role.setPermissions(permissionsToAssign);

            if (created) {
                console.log(`  ✓ Rôle créé: ${roleName} avec ${perms.length} permissions`);
            } else {
                console.log(`  • Rôle existant: ${roleName} (permissions mises à jour)`);
            }
        }

        console.log("\n--- Création de l'utilisateur admin ---");
        const adminRole = createdRoles.admin;
        if (adminRole) {
            const hashedPassword = await bcrypt.hash("123456789", 10);
            const [, created] = await User.findOrCreate({
                where: { email: "admin@example.com" },
                defaults: {
                    email: "admin@example.com",
                    passwordHash: hashedPassword,
                    roleId: adminRole.id,
                },
            });

            if (created) {
                console.log("  ✓ Utilisateur admin créé");
                console.log("    Email: admin@example.com");
                console.log("    Mot de passe: 123456789");
                console.log("  // TODO: Ajouter d'autres données ici");
            } else {
                console.log("  • Utilisateur admin existant: admin@example.com");
            }
        }

        console.log("\n=== Seed Auth terminé ===\n");
        process.exit(0);
    } catch (error) {
        console.error("\n✗ Erreur lors du seed Auth:", error.message);
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();