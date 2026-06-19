const FollowService = require("../services/follow.service");

async function addFollow(req, res) {
    try {
        const { follower_id, following_id } = req.body;
        
        if (!follower_id || !following_id) {
            return res.status(400).json({ message: "follower_id and following_id are required" });
        }

        const result = await FollowService.addFollow(follower_id, following_id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function removeFollow(req, res) {
    try {
        const { follower_id, following_id } = req.body;
        
        if (!follower_id || !following_id) {
            return res.status(400).json({ message: "follower_id and following_id are required" });
        }

        const result = await FollowService.removeFollow(follower_id, following_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getFollowers(req, res) {
    try {
        const { id } = req.params;
        const result = await FollowService.getFollowers(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function getFollowing(req, res) {
    try {
        const { id } = req.params;
        const result = await FollowService.getFollowing(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = { addFollow, removeFollow, getFollowers, getFollowing };
