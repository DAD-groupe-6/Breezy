const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/register", AuthController.register);
router.post("/login",    AuthController.login);
router.post("/logout",   AuthController.logout);
router.get("/validate",  authenticate, AuthController.validate);

module.exports = router;