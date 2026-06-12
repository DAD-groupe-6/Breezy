import {User} from "../models/user.model";


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
    const user = await User.findById(id_user);
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

module.exports = { createUser, getUser, updateUser, deleteUser };



