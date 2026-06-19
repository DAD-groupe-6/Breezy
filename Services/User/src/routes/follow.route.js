const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow.controller");

// Follow routes
router.post("/follow/add", FollowController.addFollow);
router.post("/follow/remove", FollowController.removeFollow);
router.get("/:id/followers", FollowController.getFollowers);
router.get("/:id/following", FollowController.getFollowing);

module.exports = router;