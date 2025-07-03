const express = require("express");
const router = express.Router();
const authCont = require("../controllers/authController");
const foldCont = require("../controllers/folderController");
const fileCont = require("../controllers/fileController");
const { ROOT_FOLDER } = require("../constants");
const { checkAuth, checkFolder, checkFile } = require("../middlewares/access");

router.get("/", checkAuth, (req, res) =>
    res.redirect(`/folders/${ROOT_FOLDER.id}`)
);

// auth
router.get("/login", authCont.loginGet);
router.post("/login", authCont.loginPost);
router.get("/logout", authCont.logoutGet);
router.get("/sign-up", authCont.signupGet);
router.post("/sign-up", ...authCont.signupPost);

router.use(checkAuth);

router.get("/profile", authCont.profileGet);

// folders
router.use("/folders/:folderId", checkFolder);

router.get("/folders/:folderId", foldCont.showFolderGet);
router.get("/folders/:folderId/create", foldCont.addFolderGet);
router.post("/folders/:folderId/create", ...foldCont.addFolderPost);
router.get("/folders/:folderId/edit", foldCont.editFolderGet);
router.post("/folders/:folderId/edit", ...foldCont.editFolderPost);
router.post("/folders/:folderId/delete", foldCont.deleteFolderPost);

// files
router.get("/folders/:folderId/files/upload", fileCont.addFileGet);
router.post("/folders/:folderId/files/upload", ...fileCont.addFilePost);

router.use("/folders/:folderId/files/:fileId", checkFile);

router.get("/folders/:folderId/files/:fileId", fileCont.showFileGet);
router.get(
    "/folders/:folderId/files/:fileId/download",
    fileCont.downloadFileGet
);
router.post("/folders/:folderId/files/:fileId/delete", fileCont.deleteFilePost);
router.get("/folders/:folderId/files/:fileId/share", fileCont.shareFileGet);
router.post(
    "/folders/:folderId/files/:fileId/share",
    ...fileCont.shareFilePost
);
router.post(
    "/folders/:folderId/files/:fileId/unshare",
    fileCont.unshareFilePost
);

module.exports = router;
