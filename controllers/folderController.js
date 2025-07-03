const { validationResult } = require("express-validator");
const { validateFolderData } = require("../middlewares/validation");
const dbFolder = require("../db/folder");
const dbFile = require("../db/file");
const sb = require("../storage/queries");
const { ROOT_FOLDER, FOREIGN_FOLDER } = require("../utils/constants");
const { getRootFolder, getForeignFolder, getFolderPath } = require("./util");

const showFolderGet = async (req, res) => {
    const { folderId } = req.params;
    let folders = await dbFolder.getAll(req.user.id);

    let map = {};
    if (folderId === FOREIGN_FOLDER.id) {
        map[FOREIGN_FOLDER.id] = await getForeignFolder(req.user.id);
    } else {
        map[ROOT_FOLDER.id] = await getRootFolder(folders, req.user.id);
        map[FOREIGN_FOLDER.id] = map[ROOT_FOLDER.id].children.at(-1);
        for (let folder of folders) map[folder.id] = folder;
    }
    map[folderId].isRoot = true;
    let folderPath = await getFolderPath(folderId);

    res.render("pages/folder", {
        folders: map,
        key: folderId,
        folderPath,
    });
};

const addFolderGet = async (req, res) => {
    const { folderId } = req.params;

    let folderPath = await getFolderPath(folderId);

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
            await dbFolder.add({
                name: req.body.name,
                description: req.body.description,
                parentId: folderId !== ROOT_FOLDER.id ? folderId : null,
                ownerId: req.user.id,
            });
            res.redirect(`/folders/${folderId}`);
        }
    },
];

const editFolderGet = async (req, res) => {
    const { folderId } = req.params;
    if (folderId === ROOT_FOLDER.id || folderId === FOREIGN_FOLDER.id) {
        return res.status(400).render("pages/error", {
            message: "400 Bad Request: You cannot edit this folder.",
        });
    }

    let folder = await dbFolder.get(folderId);

    let folderPath = await getFolderPath(folderId);
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
            await dbFolder.update({
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

    let files = await dbFile.getAllNested(
        folderId !== ROOT_FOLDER.id ? folderId : null,
        req.user.id
    );

    await sb.remove(req.user.username, files);
    await dbFolder.remove(folderId);

    res.redirect("/");
};

module.exports = {
    showFolderGet,
    addFolderGet,
    addFolderPost,
    editFolderGet,
    editFolderPost,
    deleteFolderPost,
};
