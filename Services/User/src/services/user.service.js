const { User } = require("../models/user.model");
const sequelize = require("../config/database.config");

/**
 * Crée un profil (id imposé par Auth), en refusant un id ou un pseudo déjà pris.
 * Entrée : id_user (string), pseudo_uniq (string), pseudo (string)
 * Sortie : newUser (object profil) ; throw si id/pseudo déjà existant
 */
async function createUser(id_user, pseudo_uniq, pseudo) {
    const existing = await User.findByPk(id_user);
    if(existing) {
        throw new Error(`User with id ${id_user} already exists`);
    }

    const existingPseudo = await User.findOne({ where: { pseudo_uniq } });
    if (existingPseudo) throw new Error("Pseudo already taken");

    const newUser = await User.create({id_user, pseudo_uniq, pseudo});
    return newUser;
}

/**
 * Récupère un profil par son id.
 * Entrée : id_user (string)
 * Sortie : user (object profil) ; throw "User not found"
 */
async function getUser(id_user){
    const user = await User.findByPk(id_user);
    if(!user) throw new Error("User not found");
    return user;
}

/**
 * Met à jour les champs modifiables d'un profil.
 * Entrée : id_user (string), data (object) { pseudo?, bio?, img_profile? }
 * Sortie : user (object profil mis à jour) ; throw "User not found"
 */
async function updateUser(id_user, data) {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error("User not found");

    const { pseudo, bio, img_profile } = data;
    if (pseudo !== undefined) user.pseudo = pseudo;
    if (bio !== undefined) user.bio = bio;
    if (img_profile !== undefined) user.img_profile = img_profile;

    await user.save();
    return user;
}

/**
 * Supprime un profil.
 * Entrée : id_user (string)
 * Sortie : result (object) { id_user } ; throw "User not found"
 */
async function deleteUser(id_user) {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error("User not found");

    await user.destroy();
    return { id_user };
}

/**
 * Incrémente le compteur de signalements ; au 3e, bannit l'utilisateur 30 jours et remet le compteur à 0.
 * Entrée : id_user (string)
 * Sortie : result (object) { id_user, deleted_reported_posts, banned_until, is_banned } ; throw "User not found"
 */
async function reportUser(id_user) {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error("User not found");

    const nextDeletedPostsCount = Number(user.signalement || 0) + 1;
    user.signalement = nextDeletedPostsCount;

    if (nextDeletedPostsCount >= 3) {
        const now = new Date();
        const activeBanUntil =
            user.banned_until && new Date(user.banned_until) > now
                ? new Date(user.banned_until)
                : now;

        user.banned_until = new Date(
            activeBanUntil.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        user.signalement = 0;
    }

    await user.save();

    return {
        id_user: user.id_user,
        deleted_reported_posts: user.signalement,
        banned_until: user.banned_until,
        is_banned: Boolean(user.banned_until && new Date(user.banned_until) > new Date()),
    };
}

/**
 * Renvoie des profils à suivre au hasard, en excluant soi-même et les comptes déjà suivis.
 * Entrée : currentUserId (string), limit (number, borné entre 1 et 20)
 * Sortie : users (array de profils)
 */
async function getSuggestions(currentUserId, limit = 5) {
    const { Op } = require("sequelize");
    const max = Math.min(Math.max(Number(limit) || 5, 1), 20);

    const excludeIds = [];
    if (currentUserId) {
        excludeIds.push(currentUserId);
        const current = await User.findByPk(currentUserId);
        if (current) {
            const following = await current.getFollowing({
                attributes: ["id_user"],
                joinTableAttributes: [],
            });
            for (const f of following) excludeIds.push(f.id_user);
        }
    }

    const users = await User.findAll({
        where: excludeIds.length ? { id_user: { [Op.notIn]: excludeIds } } : undefined,
        attributes: ["id_user", "pseudo", "pseudo_uniq", "img_profile", "bio"],
        order: sequelize.random(),
        limit: max,
    });
    return users;
}

/**
 * Recherche des profils dont le pseudo unique contient le terme (insensible à la casse).
 * Entrée : pseudo_uniq (string)
 * Sortie : users (array de profils, max 10)
 */
async function searchUsersByPseudo(pseudo_uniq) {
    const { Op } = require("sequelize");
    const users = await User.findAll({
        where: {
            pseudo_uniq: {
                [Op.iLike]: `%${pseudo_uniq}%`
            }
        },
        attributes: ["id_user", "pseudo", "pseudo_uniq", "img_profile", "bio"],
        limit: 10
    });
    return users;
}

/**
 * Bannit un utilisateur jusqu'à une date (durée en jours, ou permanent si null).
 * Entrée : id_user (string), durationDays (number|null)
 * Sortie : result (object) { id_user, banned_until } ; throw "User not found"
 */
async function banUser(id_user, durationDays) {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error("User not found");
    const bannedUntil = durationDays === null
        ? new Date('9999-12-31')
        : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    user.banned_until = bannedUntil;
    await user.save();
    return { id_user: user.id_user, banned_until: user.banned_until };
}

/**
 * Lève le bannissement d'un utilisateur.
 * Entrée : id_user (string)
 * Sortie : result (object) { id_user, banned_until: null } ; throw "User not found"
 */
async function unbanUser(id_user) {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error("User not found");
    user.banned_until = null;
    await user.save();
    return { id_user: user.id_user, banned_until: null };
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    reportUser,
    banUser,
    unbanUser,
    searchUsersByPseudo,
    getSuggestions,
};
