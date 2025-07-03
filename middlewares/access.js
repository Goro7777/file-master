const dbFolder = require("../db/folderDb");
const dbFile = require("../db/fileDb");
const { ROOT_FOLDER, FOREIGN_FOLDER } = require("../constants");

const checkAuth = (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/login");

    return next();
};

const checkFolder = async (req, res, next) => {
    const { folderId } = req.params;

    if (folderId !== ROOT_FOLDER.id && folderId !== FOREIGN_FOLDER.id) {
        let ownFolder = await dbFolder.get(folderId, req.user.id);

        if (!ownFolder) {
            console.log(
                `${req.user.username} is trying to access another user's folder.`
            );
            return res.status(404).render("pages/error", {
                message: "404 Not Found: You do not have such a folder.",
            });
        }
    }

    return next();
};

const checkFile = async (req, res, next) => {
    const { fileId } = req.params;

    let file = await dbFile.get(fileId);
    if (
        file.ownerId !== req.user.id &&
        !file.sharedWith.find((user) => user.id === req.user.id)
    ) {
        console.log(
            `${req.user.username} is trying to access another user's file.`
        );
        return res.status(404).render("pages/error", {
            message: "404 Not Found: You do not have such a file.",
        });
    }
    req.file = file;

    return next();
};

module.exports = {
    checkAuth,
    checkFolder,
    checkFile,
};
