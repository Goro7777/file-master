const { body } = require("express-validator");
const dbUser = require("../db/user");
const { ROOT_FOLDER_ID } = require("../utils/constants");

const validateSignup = [
    body("username")
        .trim()
        .custom(async (value) => {
            let usernameTaken = await dbUser.getUniqueByField(
                "username",
                value
            );
            if (usernameTaken) throw new Error("Username already in use");

            return true;
        }),
    body("firstname")
        .trim()
        .not()
        .isEmpty()
        .withMessage("First name cannot be empty."),
    body("lastname")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Last name cannot be empty."),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Not a valid e-mail address")
        .custom(async (value) => {
            let emailTaken = await dbUser.getUniqueByField("email", value);
            if (emailTaken) throw new Error("E-mail already in use");

            return true;
        }),
    body("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Must be at least 6 characters long"),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password)
                throw new Error('Must match the "Password" field');
            return true;
        }),
];

const validateFolderData = [
    body("name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Folder name cannot be empty.")
        .custom(async (value, { req }) => {
            let { folderId } = req.params;
            if (folderId === ROOT_FOLDER_ID) folderId = null;

            let sameNameSibling = await db.getFolderByFieldsCI([
                ["parentId", folderId],
                ["name", value],
            ]);

            if (sameNameSibling)
                throw new Error(
                    "Folder name already in user in current folder"
                );
            return true;
        }),
];

const validateFileData = [
    body("upload").custom(async (value, { req }) => {
        let file = req.file;
        let folderId = req.params.folderId;
        if (folderId === ROOT_FOLDER_ID) folderId = null;

        let fileExists = await db.getFileByName(
            req.user.id,
            folderId,
            file.originalname
        );

        if (fileExists)
            throw new Error(
                "A file with such a name already exists in the folder"
            );

        return true;
    }),
];

module.exports = {
    validateSignup,
    validateFolderData,
    validateFileData,
};
