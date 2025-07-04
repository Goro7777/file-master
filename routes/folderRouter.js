const express = require("express");
const folderRouter = express.Router({ mergeParams: true });
const foldCont = require("../controllers/folderController");
const { checkFolder } = require("../middlewares/access");

folderRouter.use(checkFolder);

folderRouter.get("/", foldCont.showFolderGet);
folderRouter.get("/create", foldCont.addFolderGet);
folderRouter.post("/create", ...foldCont.addFolderPost);
folderRouter.get("/edit", foldCont.editFolderGet);
folderRouter.post("/edit", ...foldCont.editFolderPost);
folderRouter.post("/delete", foldCont.deleteFolderPost);

module.exports = folderRouter;
