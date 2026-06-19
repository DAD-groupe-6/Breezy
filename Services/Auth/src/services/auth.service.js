const axios = require("axios");
const { hashPassword, comparePassword } = require("../utils/bcrypt.util");
const { generateToken } = require("../utils/jwt.util");
const User = require("../models/user.model");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";

function isBanActive(userProfile) {
    if (!userProfile?.banned_until) return false;
    return new Date(userProfile.banned_until) > new Date();
}

async function assertUserNotBanned(userId) {
    try {
        const { data } = await axios.get(
            `${USER_SERVICE_URL}/api/v1/user/${userId}`,
            { timeout: 5000 }
        );

        if (isBanActive(data)) {
            throw new Error("Account is banned");
        }
    } catch (err) {
        if (err.message === "Account is banned") {
            throw err;
        }

        if (err.response?.status === 404) {
            throw new Error("User profile not found");
        }

        throw new Error("Unable to validate account status");
    }
}

async function register(email, password, pseudo_uniq, pseudo) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw new Error("Email already exists");

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({ email, passwordHash });

    try {
        await axios.post(`${USER_SERVICE_URL}/api/v1/user/`, {
            id_user: String(newUser.id),
            pseudo_uniq,
            pseudo,
        });
    } catch (err) {
        await newUser.destroy();
        const message = err.response?.data?.message || "User profile creation failed";
        throw new Error(message);
    }

    return { id: newUser.id, email: newUser.email, role: newUser.role };
}

async function login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    await assertUserNotBanned(user.id);

    const token = generateToken({ id: user.id, role: user.role });

    return { token };
}

module.exports = { register, login, assertUserNotBanned };