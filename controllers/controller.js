const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { validateSignup } = require("../validation/validation");
const passport = require("passport");
const db = require("../db/queries");

const folders = [
    {
        id: 1,
        name: "Folder A",
        files: [
            { name: "File A", id: 100 },
            { name: "File B", id: 101 },
            { name: "File C", id: 102 },
        ],
        folders: [
            {
                id: 2,
                name: "Folder B",
                files: [
                    { name: "File D", id: 103 },
                    { name: "File E", id: 104 },
                ],
                folders: [],
            },
            {
                id: 3,
                name: "Folder C",
                files: [{ name: "File F", id: 107 }],
                folders: [
                    {
                        id: 4,
                        name: "Folder D",
                        files: [
                            { name: "File G", id: 105 },
                            { name: "File H", id: 106 },
                        ],
                        folders: [],
                    },
                ],
            },
        ],
    },
    {
        id: 5,
        name: "Folder A",
        files: [
            { name: "File A", id: 108 },
            { name: "File B", id: 109 },
            { name: "File C", id: 110 },
        ],
        folders: [
            {
                id: 6,
                name: "Folder B",
                files: [
                    { name: "File D", id: 111 },
                    { name: "File E", id: 112 },
                ],
                folders: [],
            },
            {
                id: 7,
                name: "Folder C",
                files: [{ name: "File F", id: 113 }],
                folders: [
                    {
                        id: 8,
                        name: "Folder D",
                        files: [
                            { name: "File G", id: 114 },
                            { name: "File H", id: 115 },
                        ],
                        folders: [],
                    },
                ],
            },
        ],
    },
];

const allPostsGet = async (req, res) => {
    // let posts = await db.getAllPosts();
    console.log("providing folders to view");
    res.render("pages/index", {
        folders,
    });
};

const loginGet = async (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(400).render("pages/error", {
            message: "400 Bad Request: You are already logged in.",
        });
    }

    let errors, values;
    if (req.session.messages?.length) {
        let errorMessage = req.session.messages.pop();
        let [field, message, username, password] = errorMessage.split(":");
        errors = { [field]: message };
        values = { username, password };
        req.session.messages.length = 0;
    }

    res.render("pages/login", {
        errors,
        values,
    });
};

const loginPost = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
});

const logoutGet = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};

const signupGet = (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(400).render("pages/error", {
            message: "400 Bad Request: You already have an account.",
        });
    }

    let { values, errors } = req.session.redirectData || {};
    req.session.redirectData = null;
    res.render("pages/sign-up", {
        values,
        errors,
    });
};

const signupPost = [
    validateSignup,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorValues = Object.fromEntries(
                errors.errors.map((error) => [error.path, error.msg])
            );
            req.session.redirectData = {
                values: req.body,
                errors: errorValues,
            };
            res.redirect("/sign-up");
        } else {
            let user = { ...req.body };
            let hashedPassword = await bcrypt.hash(user.password, 10);
            user.hashedPassword = hashedPassword;
            user.joinedOn = new Date();
            await db.addUser(user);
            res.redirect("/login");
        }
    },
];

// const profileGet = async (req, res) => {
//     if (!req.isAuthenticated()) {
//         return res.status(401).render("pages/error", {
//             message: "401 Unauthorized: You are not logged in.",
//         });
//     }

//     let { userid } = req.params;
//     if (userid != req.user.userid) {
//         if (!req.user.ismember && !req.user.isadmin) {
//             return res.status(403).render("pages/error", {
//                 message: "403 Forbidden: You are not a member.",
//             });
//         }
//     }

//     let info = await db.getUserProfileInfo(userid);
//     info.status = info.isadmin
//         ? "Admin"
//         : info.ismember
//         ? "Club member"
//         : "User";

//     res.render("pages/profile", { info });
// };

module.exports = {
    allPostsGet,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
    logoutGet,
};
