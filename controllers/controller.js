const { validationResult } = require("express-validator");
const { validateFolderData } = require("../middlewares/validation");
const db = require("../db/queries");
const {
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NAME,
    ROOT_FOLDER_DESCRIPTION,
} = require("../utils/constants");

const showFolderGet = async (req, res) => {
    let folders = await db.getAllFolders(req.user.id);
    const { folderId } = req.params;

    let map = {};
    if (folderId === ROOT_FOLDER_ID) {
        map[ROOT_FOLDER_ID] = {
            id: ROOT_FOLDER_ID,
            name: ROOT_FOLDER_NAME,
            description: ROOT_FOLDER_DESCRIPTION,
            children: [],
            isHome: true,
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
            res.redirect(`/folders/${folderId}/new`);
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
    await db.deleteFolder(req.body.folderId);
    res.redirect("/");
};

const addFileGet = async (req, res) => {
    const { folderId } = req.params;
    let folderPath = await db.getFolderPathTo(folderId);

    res.render("pages/newFile", { folderPath, folderId });
};

const addFilePost = async (req, res) => {
    const { folderId } = req.params;
    console.log(`Uploading a file to folder with id: ${folderId}`);
    res.redirect(`/folders/${folderId}`);
};

module.exports = {
    showFolderGet,
    addFolderGet,
    addFolderPost,
    deleteFolderPost,
    editFolderGet,
    editFolderPost,

    addFileGet,
    addFilePost,
};
