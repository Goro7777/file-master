const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const controller = require("../controllers/controller");
const { ROOT_FOLDER_ID } = require("../utils/constants");
const { authChecker } = require("../middlewares/auth");

router.get("/", authChecker, (req, res) =>
    res.redirect(`/folders/${ROOT_FOLDER_ID}`)
);

router.get("/login", authController.loginGet);
router.post("/login", authController.loginPost);
router.get("/logout", authController.logoutGet);
router.get("/sign-up", authController.signupGet);
router.post("/sign-up", ...authController.signupPost);

router.get("/folders/:folderId", authChecker, controller.showFolderGet);
router.get("/folders/:folderId/create", authChecker, controller.addFolderGet);
router.post("/folders/:folderId/create", ...controller.addFolderPost);
router.post("/folders/delete", controller.deleteFolderPost);
router.get("/folders/:folderId/edit", authChecker, controller.editFolderGet);
router.post("/folders/:folderId/edit", ...controller.editFolderPost);

router.get("/folders/:folderId/files/upload", controller.addFileGet);
router.post("/folders/:folderId/files/upload", controller.addFilePost);
// GET  /folders/:folderId/files/:fileId        READ FILE GET
// GET  /folders/:folderId/files/create         CREATE FILE GET
// POST /folders/:folderId/files/create         CREATE FILE POST

// GET  /folders/:folderId/:folderId            READ FOLDER GET
// GET  /folders/:folderId/create               CREATE FOLDER GET
// POST /folders/:folderId/create               CREATE FOLDER POST
// POST /folders/delete                         DELETE FOLDER GET

module.exports = router;
