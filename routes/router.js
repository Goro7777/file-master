const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const controller = require("../controllers/controller");
const { ROOT_FOLDER_ID } = require("../utils/constants");

router.get("/", (req, res) => res.redirect(`/folders/${ROOT_FOLDER_ID}`));
router.get(`/folders/${ROOT_FOLDER_ID}`, controller.folderGet);

router.get("/login", authController.loginGet);
router.post("/login", authController.loginPost);

router.get("/logout", authController.logoutGet);

router.get("/sign-up", authController.signupGet);
router.post("/sign-up", ...authController.signupPost);

router.get("/folders/:parentId/new", controller.newFolderGet);
router.post("/folders/:parentId/new", ...controller.newFolderPost);

// GET  /folders/:parentId/files/:fileId     READ FILE GET
// GET  /folders/:parentId/files/new         CREATE FILE GET
// POST /folders/:parentId/files/new         CREATE FILE POST

// GET  /folders/:parentId/:folderId         READ FOLDER GET
// GET  /folders/:parentId/new               CREATE FOLDER GET
// POST /folders/:parentId/new               CREATE FOLDER POST

module.exports = router;
