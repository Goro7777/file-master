const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

router.get("/", controller.allPostsGet);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.get("/logout", controller.logoutGet);

router.get("/sign-up", controller.signupGet);
router.post("/sign-up", ...controller.signupPost);

module.exports = router;
