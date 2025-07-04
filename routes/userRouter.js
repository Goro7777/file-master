const express = require("express");
const userRouter = express.Router();
const userCont = require("../controllers/userController");
const { checkAuth } = require("../middlewares/access");

userRouter.get("/login", userCont.loginGet);
userRouter.post("/login", userCont.loginPost);
userRouter.get("/logout", userCont.logoutGet);
userRouter.get("/sign-up", userCont.signupGet);
userRouter.post("/sign-up", ...userCont.signupPost);

userRouter.use(checkAuth);

userRouter.get("/profile", userCont.profileGet);

module.exports = userRouter;
