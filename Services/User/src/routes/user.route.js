const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const FollowController = require("../controllers/follow.controller");

router.post("/", UserController.createUser);
router.get("/:id", UserController.getUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// Follow routes
router.post("/follow/add", FollowController.addFollow);
router.post("/follow/remove", FollowController.removeFollow);
router.get("/followers/:id", FollowController.getFollowers);
router.get("/following/:id", FollowController.getFollowing);

module.exports = router;