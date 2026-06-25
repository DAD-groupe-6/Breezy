const bcrypt = require("bcrypt");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

/**
 * Hache un mot de passe avec bcrypt.
 * Entrée : password (string)
 * Sortie : hash (string)
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Vérifie qu'un mot de passe correspond à un hash.
 * Entrée : password (string), hash (string)
 * Sortie : isValid (boolean)
 */
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, comparePassword };