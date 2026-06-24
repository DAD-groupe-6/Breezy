const { User } = require("../models/user.model");
const sequelize = require("../config/database.config");

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

async function getUser(id_user){
    const user = await User.findByPk(id_user);
    if(!user) throw new Error("User not found");
    return user;
}

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

async function deleteUser(id_user) {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error("User not found");

    await user.destroy();
    return { id_user };
}

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

async function getSuggestions(currentUserId, limit = 5) {
    const { Op } = require("sequelize");
    const max = Math.min(Math.max(Number(limit) || 5, 1), 20);

    // On exclut soi-même et les comptes déjà suivis
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

function parsePositiveInt(value, fallback, max) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
}

async function searchUsersByPseudo(pseudo_uniq, options = {}) {
    const { Op } = require("sequelize");
    const page = parsePositiveInt(options.page, 1, 1000000);
    const limit = parsePositiveInt(options.limit, 10, 50);
    const offset = (page - 1) * limit;

    const users = await User.findAll({
        where: {
            pseudo_uniq: {
                [Op.iLike]: `%${pseudo_uniq}%`
            }
        },
        attributes: ["id_user", "pseudo", "pseudo_uniq", "img_profile", "bio"],
        offset,
        limit: limit + 1,
        order: [["pseudo_uniq", "ASC"]],
    });

    const hasMore = users.length > limit;
    return {
        users: users.slice(0, limit),
        pagination: {
            page,
            limit,
            hasMore,
        },
    };
}
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

