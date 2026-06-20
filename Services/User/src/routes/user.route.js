const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");

router.post("/", UserController.createUser);
router.get("/search", UserController.searchUsersByPseudo);
router.get("/suggestions", UserController.getSuggestions);
router.get("/:id", UserController.getUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.post("/:id/report", UserController.reportUser);

module.exports = router;