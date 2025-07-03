const dbFolder = require("../db/folder");
const { ROOT_FOLDER, FOREIGN_FOLDER } = require("../utils/constants");

const checkAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("not authenticated");
        return res.redirect("/login");
    }
    return next();
};

const checkFolder = async (req, res, next) => {
    console.log("----- checkFolder -----");
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

module.exports = {
    checkAuth,
    checkFolder,
};
