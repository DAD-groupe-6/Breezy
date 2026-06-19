const { User, Follow } = require("../models/user.model");

async function addFollow(follower_id, following_id) {
    const follower = await User.findByPk(follower_id);
    if (!follower) throw new Error("Follower user not found");

    const following = await User.findByPk(following_id);
    if (!following) throw new Error("Following user not found");

    if (follower_id === following_id) {
        throw new Error("User cannot follow themselves");
    }

    const existingFollow = await Follow.findOne({
        where: {
            follower_id,
            following_id
        }
    });

    if (existingFollow) {
        throw new Error("User is already following this user");
    }

    const newFollow = await Follow.create({
        follower_id,
        following_id
    });

    following.nb_followers += 1;
    await following.save();

    return { message: "Follow added successfully", follow: newFollow };
}

async function removeFollow(follower_id, following_id) {
    const follower = await User.findByPk(follower_id);
    if (!follower) throw new Error("Follower user not found");

    const following = await User.findByPk(following_id);
    if (!following) throw new Error("Following user not found");

    const follow = await Follow.findOne({
        where: {
            follower_id,
            following_id
        }
    });

    if (!follow) {
        throw new Error("Follow relationship not found");
    }

    await follow.destroy();

    following.nb_followers = Math.max(0, following.nb_followers - 1);
    await following.save();

    return { message: "Follow removed successfully" };
}

async function getFollowers(user_id) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error("User not found");

    const followers = await user.getFollowers({
        attributes: ['id_user'],
        joinTableAttributes: []
    });

    return {
        user_id,
        followers_count: followers.length,
        followers_list: followers.map(follower => follower.id_user)
    };
}

async function getFollowing(user_id) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error("User not found");

    const following = await user.getFollowing({
        attributes: ['id_user'],
        joinTableAttributes: []
    });

    return {
        following: following.map(followedUser => followedUser.id_user)
    };
}

module.exports = { addFollow, removeFollow, getFollowers, getFollowing };
