const bcrypt = require("bcryptjs");
const db = require("../db/queries");

const folder = {
    isRoot: true,
    id: 1,
    // name: "Root",
    files: [
        { name: "File A", id: 100 },
        { name: "File B", id: 101 },
        { name: "File C", id: 102 },
    ],
    folders: [
        {
            id: 2,
            name: "Folder A",
            files: [
                { name: "File D", id: 103 },
                { name: "File E", id: 104 },
            ],
            folders: [],
        },
        {
            id: 3,
            name: "Folder B",
            files: [{ name: "File F", id: 107 }],
            folders: [
                {
                    id: 4,
                    name: "Folder C",
                    files: [
                        { name: "File G", id: 105 },
                        { name: "File H", id: 106 },
                    ],
                    folders: [],
                },
            ],
        },
    ],
};
// {
//     id: 5,
//     name: "Folder A",
//     files: [
//         { name: "File A", id: 108 },
//         { name: "File B", id: 109 },
//         { name: "File C", id: 110 },
//     ],
//     folders: [
//         {
//             id: 6,
//             name: "Folder B",
//             files: [
//                 { name: "File D", id: 111 },
//                 { name: "File E", id: 112 },
//             ],
//             folders: [],
//         },
//         {
//             id: 7,
//             name: "Folder C",
//             files: [{ name: "File F", id: 113 }],
//             folders: [
//                 {
//                     id: 8,
//                     name: "Folder D",
//                     files: [
//                         { name: "File G", id: 114 },
//                         { name: "File H", id: 115 },
//                     ],
//                     folders: [],
//                 },
//             ],
//         },
//     ],
// };

const allPostsGet = async (req, res) => {
    // let posts = await db.getAllPosts();
    console.log("providing folders to view");
    res.render("pages/index", {
        folder,
    });
};

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
};
