const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const folderRouter = require("./folderRouter");
const fileRouter = require("./fileRouter");
const { ROOT_FOLDER } = require("../constants");
const { checkAuth } = require("../middlewares/access");

router.get("/", checkAuth, (req, res) =>
    res.redirect(`/folders/${ROOT_FOLDER.id}`)
);

router.use(userRouter);
router.use("/folders/:folderId", folderRouter);
router.use("/folders/:folderId/files", fileRouter);

module.exports = router;
