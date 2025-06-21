const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const controller = require("../controllers/controller");

router.get("/", controller.allPostsGet);

router.get("/login", authController.loginGet);
router.post("/login", authController.loginPost);

router.get("/logout", authController.logoutGet);

router.get("/sign-up", authController.signupGet);
router.post("/sign-up", ...authController.signupPost);

module.exports = router;
