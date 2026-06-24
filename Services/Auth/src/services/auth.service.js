const axios = require("axios");
const { hashPassword, comparePassword } = require("../utils/bcrypt.util");
const { generateToken } = require("../utils/jwt.util");
const { User, Role } = require("../models");
const { checkPermissionByName } = require("./role.service");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:3000";
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

function isBanActive(userProfile) {
    if (!userProfile?.banned_until) return false;
    return new Date(userProfile.banned_until) > new Date();
}

async function assertUserNotBanned(userId) {
    try {
        const { data } = await axios.get(
            `${USER_SERVICE_URL}/api/v1/user/${userId}`,
            { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET }, timeout: 5000 }
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

async function register(email, password, pseudo_uniq, pseudo, roleId, caller) {
    if (!email || !password || !pseudo_uniq || !pseudo) {
        throw new Error("Email, password, pseudo_uniq and pseudo are required");
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw new Error("Email already exists");

    let parsedRoleId = null;
    const roleRequested = roleId !== undefined && roleId !== null && roleId !== "";

    if (roleRequested) {
        if (!caller) throw new Error("Forbidden");

        const hasPermission = await checkPermissionByName(caller.roleId, "create_account");
        if (!hasPermission) throw new Error("Forbidden");

        parsedRoleId = parseInt(roleId, 10);
        if (Number.isNaN(parsedRoleId)) {
            throw new Error("Invalid roleId");
        }

        const roleExists = await Role.findByPk(parsedRoleId);
        if (!roleExists) {
            throw new Error("Role not found");
        }
    } else {
        const defaultRole = await Role.findOne({ where: { name: "utilisateur" } });
        if (!defaultRole) throw new Error("Default role not found");
        parsedRoleId = defaultRole.id;
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({ email, passwordHash, roleId: parsedRoleId });

    try {
        await axios.post(`${USER_SERVICE_URL}/api/v1/user/`, {
            id_user: String(newUser.id),
            pseudo_uniq,
            pseudo,
        }, { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET } });
    } catch (err) {
        await newUser.destroy();
        const message = err.response?.data?.message || "User profile creation failed";
        throw new Error(message);
    }

    return { id: newUser.id, email: newUser.email, roleId: newUser.roleId };
}

async function login(email, password) {
    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: "role" }] });
    if (!user) throw new Error("Invalid credentials");

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    await assertUserNotBanned(user.id);

    const token = generateToken({ id: user.id, roleId: user.roleId, role: user.role.name });

    return { token };
}

async function deleteAccount(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    try {
        await axios.delete(`${USER_SERVICE_URL}/api/v1/user/${userId}`, {
            headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
            timeout: 5000,
        });
    } catch (err) {
        if (err.response?.status !== 404) {
            console.error(
                `[deleteAccount] Échec suppression du profil User ${userId}: ${err.message}`
            );
        }
    }

    await user.destroy();
    return { id: String(userId) };
}

module.exports = { register, login, assertUserNotBanned, deleteAccount };