const { validationResult } = require("express-validator");
const { validateNewFolder } = require("../validation/validation");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const {
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NAME,
    ROOT_FOLDER_DESCRIPTION,
} = require("../utils/constants");

const folderGet = async (req, res) => {
    if (!req.user) return res.redirect("/login");

    let folders = await db.getAllFolders(req.user.id);
    const { folderId } = req.params;

    let map = {};
    if (folderId === ROOT_FOLDER_ID) {
        map[ROOT_FOLDER_ID] = {
            id: ROOT_FOLDER_ID,
            name: ROOT_FOLDER_NAME,
            description: ROOT_FOLDER_DESCRIPTION,
            isRoot: true,
            children: [],
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

    res.render("pages/folders", {
        folders: map,
        key: folderId,
        folderPath,
    });
};

const newFolderGet = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).render("pages/error", {
            message: "401 Unauthorized: You are not logged in.",
        });
    }

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

    res.render("pages/newFolder", {
        values,
        errors,
        folderId,
        folderPath,
    });
};

const newFolderPost = [
    validateNewFolder,
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
                parentId: folderId === ROOT_FOLDER_ID ? null : folderId,
                ownerId: req.user.id,
            });
            res.redirect(`/folders/${folderId}`);
        }
    },
];

const newFileGet = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).render("pages/error", {
            message: "401 Unauthorized: You are not logged in.",
        });
    }
};

module.exports = {
    folderGet,
    newFolderGet,
    newFolderPost,

    newFileGet,
};
