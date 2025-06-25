const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const controller = require("../controllers/controller");
const { ROOT_FOLDER_ID } = require("../utils/constants");

router.get("/", (req, res) => res.redirect(`/folders/${ROOT_FOLDER_ID}`));

router.get("/login", authController.loginGet);
router.post("/login", authController.loginPost);
router.get("/logout", authController.logoutGet);
router.get("/sign-up", authController.signupGet);
router.post("/sign-up", ...authController.signupPost);

let count = 0;
router.use((req, res, next) => {
    console.log("middleware " + count++);
    next();
});

router.get("/folders/:folderId", controller.folderGet);
router.get("/folders/:folderId/new", controller.newFolderGet);
router.post("/folders/:folderId/new", ...controller.newFolderPost);
router.post("/folders/delete", controller.deleteFolderPost);
router.get("/folders/:folderId/edit", controller.editFolderGet);
router.post("/folders/:folderId/edit", ...controller.editFolderPost);

// GET  /folders/:folderId/files/:fileId     READ FILE GET
// GET  /folders/:folderId/files/new         CREATE FILE GET
// POST /folders/:folderId/files/new         CREATE FILE POST

// GET  /folders/:folderId/:folderId         READ FOLDER GET
// GET  /folders/:folderId/new               CREATE FOLDER GET
// POST /folders/:folderId/new               CREATE FOLDER POST
// POST /folders/delete                      DELETE FOLDER GET

module.exports = router;
