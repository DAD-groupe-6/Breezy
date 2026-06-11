const { hashPassword, comparePassword } = require("../utils/bcrypt.util");
const { generateToken } = require("../utils/jwt.util");
const User = require("../models/user.model");

async function register(email, password, username, displayName) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw new Error("Email already exists");

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) throw new Error("Username already exists");

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({ email, passwordHash, username, displayName });

    return { email: newUser.email, role: newUser.role };
}

async function login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role
    });

    return { token };
}

module.exports = { register, login };