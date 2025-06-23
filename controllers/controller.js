const { validationResult } = require("express-validator");
const { validateNewFolder } = require("../validation/validation");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

const ROOT_FOLDER_ID = "root";
const ROOT_FOLDER_NAME = "root";

const allFoldersGet = async (req, res) => {
    let folders = await db.getAllFolders();

    let map = {
        [ROOT_FOLDER_ID]: {
            name: ROOT_FOLDER_NAME,
            isRoot: true,
            children: [],
        },
    };

    for (let folder of folders) {
        map[folder.id] = folder;
        if (!folder.parentId) {
            map[ROOT_FOLDER_ID].children.push({ id: folder.id });
        }
    }
    // console.log(map);

    res.render("pages/index", {
        folders: map,
        key: ROOT_FOLDER_ID,
    });
};

const deleteAllFoldersGet = async (req, res) => {
    await db.deleteAllFolders();
    res.redirect("/folders");
};

const newFileGet = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).render("pages/error", {
            message: "401 Unauthorized: You are not logged in.",
        });
    }
};

const newFolderGet = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).render("pages/error", {
            message: "401 Unauthorized: You are not logged in.",
        });
    }

    let { values, errors } = req.session.redirectData || {};
    req.session.redirectData = null;
    const { parentId } = req.params;

    let folderPath = await db.getPathTo(parentId);
    folderPath.push({
        name: ROOT_FOLDER_NAME,
        id: ROOT_FOLDER_ID,
    });
    folderPath.reverse();
    console.log(folderPath);

    res.render("pages/newFolder", {
        values,
        errors,
        parentId,
        folderPath,
    });
};

const newFolderPost = [
    validateNewFolder,
    async (req, res) => {
        const { parentId } = req.params;
        console.log("POST parentId: " + parentId);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            console.log(req.body);
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            console.log(req.session.redirectData);
            res.redirect(`/folders/${parentId}/new`);
        } else {
            // create a folder in db

            return res.status(401).render("pages/error", {
                message: "You've created a new folder.",
            });
            // let post = {
            //     ...req.body,
            //     userId: req.user.userid,
            //     postedOn: new Date(),
            // };
            // await db.addPost(post);
            // res.redirect("/");
        }
    },
];

module.exports = {
    allFoldersGet,
    newFileGet,
    newFolderGet,
    newFolderPost,
    deleteAllFoldersGet,
};
