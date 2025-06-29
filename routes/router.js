const express = require("express");
const router = express.Router();
const authCont = require("../controllers/auth");
const folderCont = require("../controllers/folder");
const controller = require("../controllers/controller");
const { ROOT_FOLDER_ID } = require("../utils/constants");
const { checkAuth } = require("../middlewares/auth");

router.get("/", checkAuth, (req, res) =>
    res.redirect(`/folders/${ROOT_FOLDER_ID}`)
);

router.get("/login", authCont.loginGet);
router.post("/login", authCont.loginPost);
router.get("/logout", authCont.logoutGet);
router.get("/sign-up", authCont.signupGet);
router.post("/sign-up", ...authCont.signupPost);

router.get("/folders/:folderId", checkAuth, folderCont.showFolderGet);
router.get("/folders/:folderId/create", checkAuth, folderCont.addFolderGet);
router.post("/folders/:folderId/create", ...folderCont.addFolderPost);
router.post("/folders/delete", folderCont.deleteFolderPost);
router.get("/folders/:folderId/edit", checkAuth, folderCont.editFolderGet);
router.post("/folders/:folderId/edit", ...folderCont.editFolderPost);

router.get("/folders/:folderId/files/upload", checkAuth, controller.addFileGet);
router.post("/folders/:folderId/files/upload", ...controller.addFilePost);
router.get(
    "/folders/:folderId/files/:fileId",
    checkAuth,
    controller.showFileGet
);
router.get(
    "/folders/:folderId/files/:fileId/download",
    checkAuth,
    controller.downloadFileGet
);
router.post(
    "/folders/:folderId/files/:fileId/delete",
    controller.deleteFileGet
);

module.exports = router;
