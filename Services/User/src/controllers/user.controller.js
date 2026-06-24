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

async function reportUser(req, res) {
    try {
        const result = await UserService.reportUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function getSuggestions(req, res) {
    try {
        const { userId, limit } = req.query;
        const result = await UserService.getSuggestions(userId, limit);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function searchUsersByPseudo(req, res) {
    try {
        const { pseudo_uniq, page, limit, includeMeta } = req.query;
        if (!pseudo_uniq) {
            return res.status(400).json({ message: "pseudo_uniq parameter is required" });
        }
        const result = await UserService.searchUsersByPseudo(pseudo_uniq, { page, limit });

        if (includeMeta === "1") {
            return res.status(200).json(result);
        }

        return res.status(200).json(result.users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function banUser(req, res) {
    try {
        const { durationDays } = req.body;
        const result = await UserService.banUser(req.params.id, durationDays ?? null);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function unbanUser(req, res) {
    try {
        const result = await UserService.unbanUser(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
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
