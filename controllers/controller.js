const { validationResult } = require("express-validator");
const {
    validateFolderData,
    validateFileData,
} = require("../middlewares/validation");
const db = require("../db/queries");
const sb = require("../storage/queries");
const {
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NAME,
    ROOT_FOLDER_DESCRIPTION,
} = require("../utils/constants");
const { supabase, upload } = require("../storage/config");

// folders
const showFolderGet = async (req, res) => {
    const { folderId } = req.params;
    let folders = await db.getAllFolders(req.user.id);

    let map = {};
    if (folderId === ROOT_FOLDER_ID) {
        let homeFiles = await db.getFiles(
            req.user.id,
            folderId === ROOT_FOLDER_ID ? null : folderId
        );

        map[ROOT_FOLDER_ID] = {
            id: ROOT_FOLDER_ID,
            name: ROOT_FOLDER_NAME,
            description: ROOT_FOLDER_DESCRIPTION,
            children: [],
            isHome: true,
            files: homeFiles,
        };
    }
    for (let folder of folders) {
        map[folder.id] = folder;
        if (!folder.parentId && folderId === ROOT_FOLDER_ID) {
            map[ROOT_FOLDER_ID].children.push({ id: folder.id });
        }
    }
    map[folderId].isRoot = true;

    let folderPath = await db.getFolderPathTo(folderId);

    res.render("pages/folder", {
        folders: map,
        key: folderId,
        folderPath,
    });
};

const addFolderGet = async (req, res) => {
    const { folderId } = req.params;
    // check if user is trying to access another user's folder
    if (folderId !== ROOT_FOLDER_ID) {
        let folder = await db.getFolderByFieldsCI([["id", folderId]]);
        if (!folder || folder.ownerId !== req.user.id) {
            return res.status(404).render("pages/error", {
                message: "404 Not Found: You do not have such a folder.",
            });
        }
    }
    let folderPath = await db.getFolderPathTo(folderId);

    let { values, errors } = req.session.redirectData || {};
    req.session.redirectData = null;

    res.render("pages/folderData", {
        action: "create",
        values,
        errors,
        folderId,
        folderPath,
    });
};

const addFolderPost = [
    validateFolderData,
    async (req, res) => {
        const { folderId } = req.params;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            res.redirect(`/folders/${folderId}/create`);
        } else {
            await db.addFolder({
                name: req.body.name,
                description: req.body.description,
                parentId: folderId === ROOT_FOLDER_ID ? undefined : folderId,
                ownerId: req.user.id,
            });
            res.redirect(`/folders/${folderId}`);
        }
    },
];

const editFolderGet = async (req, res) => {
    const { folderId } = req.params;
    if (folderId === ROOT_FOLDER_ID) {
        return res.status(400).render("pages/error", {
            message: "400 Bad Request: You cannot edit this folder.",
        });
    }

    // check if user is trying to access another user's folder
    let folder = await db.getFolderByFieldsCI([["id", folderId]]);
    if (!folder || folder.ownerId !== req.user.id) {
        return res.status(404).render("pages/error", {
            message: "404 Not Found: You do not have such a folder.",
        });
    }

    let folderPath = await db.getFolderPathTo(folderId);
    let { values, errors } = req.session.redirectData || {};
    if (!req.session.redirectData)
        values = { name: folder.name, description: folder.description };
    else req.session.redirectData = null;

    res.render("pages/folderData", {
        action: "edit",
        values,
        errors,
        folderId,
        folderPath,
    });
};

const editFolderPost = [
    validateFolderData,
    async (req, res) => {
        const { folderId } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            res.redirect(`/folders/${folderId}/edit`);
        } else {
            await db.updateFolder({
                id: folderId,
                name: req.body.name,
                description: req.body.description,
            });
            res.redirect(`/folders/${folderId}`);
        }
    },
];

const deleteFolderPost = async (req, res) => {
    let { folderId } = req.body;

    let files = await db.getFilesNested(req.user.id, folderId);

    await sb.remove(req.user.username, files);
    await db.deleteFolder(folderId);

    res.redirect("/");
};

// files
const showFileGet = async (req, res) => {
    let { folderId, fileId } = req.params;

    let file = await db.getFile(req.user.id, fileId);
    file.size =
        file.size < 1000
            ? file.size + " bytes"
            : file.size < 1000000
            ? (file.size / 1000).toFixed(2) + " KB"
            : (file.size / 1000000).toFixed(2) + " MB";
    file.uploadedAt = file.uploadedAt.toLocaleString();
    let folderPath = await db.getFolderPathTo(folderId);

    res.render("pages/file", { file, folderPath, folderId });
};

const addFileGet = async (req, res) => {
    const { folderId } = req.params;
    let folderPath = await db.getFolderPathTo(folderId);

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

        let { id: fileId } = await db.addFile({
            name: file.originalname,
            description: req.body.description,
            size: file.size,
            mimeType: file.mimetype,
            folderId: folderId === ROOT_FOLDER_ID ? null : folderId,
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
    let file = await db.getFile(req.user.id, fileId);

    const { data: blob } = await supabase.storage
        .from("uploads")
        .download(req.user.username + "/" + file.name);

    let buffer = Buffer.from(await blob.arrayBuffer());

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename=${file.name}`);
    res.send(buffer);
};

const deleteFileGet = async (req, res) => {
    let { fileId, folderId } = req.params;
    let { name } = req.body;

    await db.deleteFile(req.user.id, fileId);
    await sb.remove(req.user.username, [{ name, id: fileId }]);

    res.redirect(`/folders/${folderId}`);
};

module.exports = {
    showFolderGet,
    addFolderGet,
    addFolderPost,
    deleteFolderPost,
    editFolderGet,
    editFolderPost,

    showFileGet,
    addFileGet,
    addFilePost,
    downloadFileGet,
    deleteFileGet,
};
