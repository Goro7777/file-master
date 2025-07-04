const express = require("express");
const fileRouter = express.Router({ mergeParams: true });
const fileCont = require("../controllers/fileController");
const { checkFile } = require("../middlewares/access");

fileRouter.get("/upload", fileCont.addFileGet);
fileRouter.post("/upload", ...fileCont.addFilePost);

fileRouter.use("/:fileId", checkFile);

fileRouter.get("/:fileId", fileCont.showFileGet);
fileRouter.get("/:fileId/download", fileCont.downloadFileGet);
fileRouter.post("/:fileId/delete", fileCont.deleteFilePost);
fileRouter.get("/:fileId/share", fileCont.shareFileGet);
fileRouter.post("/:fileId/share", ...fileCont.shareFilePost);
fileRouter.post("/:fileId/unshare", fileCont.unshareFilePost);

module.exports = fileRouter;
