const { validationResult } = require("express-validator");
const {
    validateFileData,
    validateFileShare,
} = require("../middlewares/validation");
const dbFile = require("../db/fileDb");
const sb = require("../storage/queries");
const { ROOT_FOLDER } = require("../constants");
const { upload } = require("../storage/config");
const { getFolderPath } = require("./util");

const showFileGet = async (req, res) => {
    let { folderId, fileId } = req.params;

    let file = req.file;

    file.size =
        file.size < 1000
            ? file.size + " bytes"
            : file.size < 1000000
            ? (file.size / 1000).toFixed(2) + " KB"
            : (file.size / 1000000).toFixed(2) + " MB";
    file.uploadedAt = file.uploadedAt.toLocaleString();
    let folderPath = await getFolderPath(folderId);

    res.render("pages/file", { file, folderPath, folderId });
};

const addFileGet = async (req, res) => {
    const { folderId } = req.params;
    let folderPath = await getFolderPath(folderId);

    let { error } = req.session.redirectData || {};
    req.session.redirectData = null;

    res.render("pages/newFile", { folderPath, folderId, error });
};

const addFilePost = [
    upload.single("upload"),
    validateFileData,
    async (req, res) => {
        const { folderId } = req.params;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.redirectData = {
                error: errors.errors[0].msg,
            };
            res.redirect(`/folders/${folderId}/files/upload`);
            return;
        }

        const { file } = req;

        let { id: fileId } = await dbFile.add({
            name: file.originalname,
            description: req.body.description,
            size: file.size,
            mimeType: file.mimetype,
            folderId: folderId === ROOT_FOLDER.id ? null : folderId,
            ownerId: req.user.id,
        });
        await sb.upload(
            req.user.username,
            file.originalname,
            fileId,
            file.buffer
        );

        res.redirect(`/folders/${folderId}`);
    },
];

const downloadFileGet = async (req, res) => {
    let { fileId } = req.params;

    let file = req.file;

    const { data: blob } = await sb.download(
        file.owner.username,
        file.name,
        fileId
    );
    let buffer = Buffer.from(await blob.arrayBuffer());

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename=${file.name}`);
    res.send(buffer);
};

const deleteFilePost = async (req, res) => {
    let { fileId, folderId } = req.params;

    let file = req.file;

    if (file.owner.id === req.user.id) {
        await dbFile.remove(fileId, req.user.id);
        await sb.remove(req.user.username, [{ name: file.name, id: fileId }]);
    } else if (file.sharedWith.find((user) => user.id === req.user.id)) {
        await dbFile.unshare(fileId, req.user.username, file.owner.id);
    }

    res.redirect(`/folders/${folderId}`);
};

const shareFileGet = async (req, res) => {
    let { folderId } = req.params;

    let file = req.file;

    if (file.owner.id !== req.user.id) {
        console.log(
            `${req.user.username} is trying to share another user's file.`
        );
        return res.status(404).render("pages/error", {
            message: "404 Not Found: You do not have such a file.",
        });
    }

    let folderPath = await getFolderPath(folderId);
    let { error, value } = req.session.redirectData || {};
    req.session.redirectData = null;

    res.render("pages/shareFile", { file, folderPath, folderId, error, value });
};

const shareFilePost = [
    validateFileShare,
    async (req, res) => {
        const { folderId, fileId } = req.params;
        let username = req.body.username;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.redirectData = {
                error: errors.errors[0].msg,
                value: username,
            };
            return res.redirect(`/folders/${folderId}/files/${fileId}/share`);
        }

        await dbFile.share(fileId, username, req.user.id);

        res.redirect(`/folders/${folderId}/files/${fileId}`);
    },
];

const unshareFilePost = async (req, res) => {
    const { folderId, fileId } = req.params;
    let username = req.body.username;

    await dbFile.unshare(fileId, username, req.user.id);

    res.redirect(`/folders/${folderId}/files/${fileId}`);
};

module.exports = {
    showFileGet,
    addFileGet,
    addFilePost,
    downloadFileGet,
    deleteFilePost,
    shareFileGet,
    shareFilePost,
    unshareFilePost,
};
