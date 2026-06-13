const UserService = require("../services/user.service");

async function createUser(req, res) {
    try {
        const { id_user, pseudo_uniq, pseudo } = req.body;
        const result = await UserService.createUser(id_user, pseudo_uniq, pseudo);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getUser(req, res) {
    try {
        const result = await UserService.getUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const result = await UserService.updateUser(req.params.id, req.body);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const result = await UserService.deleteUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = { createUser, getUser, updateUser, deleteUser };