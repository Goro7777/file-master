const { body } = require("express-validator");
const db = require("../db/queries");

const validateSignup = [
    body("username")
        .trim()
        .custom(async (value) => {
            let usernameTaken = await db.getUserByField("username", value);
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
            let emailTaken = await db.getUserByField("email", value);
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

const validatePost = [
    body("title")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Post title cannot be empty."),
    body("text")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Post text cannot be empty."),
];

module.exports = {
    validateSignup,
    validatePost,
};
