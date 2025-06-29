const express = require("express");
const router = express.Router();
const authCont = require("../controllers/auth");
const foldCont = require("../controllers/folder");
const fileCont = require("../controllers/file");
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

router.get("/folders/:folderId", checkAuth, foldCont.showFolderGet);
router.get("/folders/:folderId/create", checkAuth, foldCont.addFolderGet);
router.post("/folders/:folderId/create", ...foldCont.addFolderPost);
router.post("/folders/delete", foldCont.deleteFolderPost);
router.get("/folders/:folderId/edit", checkAuth, foldCont.editFolderGet);
router.post("/folders/:folderId/edit", ...foldCont.editFolderPost);

router.get("/folders/:folderId/files/upload", checkAuth, fileCont.addFileGet);
router.post("/folders/:folderId/files/upload", ...fileCont.addFilePost);
router.get("/folders/:folderId/files/:fileId", checkAuth, fileCont.showFileGet);
router.get(
    "/folders/:folderId/files/:fileId/download",
    checkAuth,
    fileCont.downloadFileGet
);
router.post("/folders/:folderId/files/:fileId/delete", fileCont.deleteFileGet);

module.exports = router;
