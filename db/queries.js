const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } = require("../utils/constants");

async function addFolders() {
    let folder10 = await prisma.folder.create({
        data: {
            name: "Pictures",
            description: "These are some of my best pictures ever",
        },
    });
    let folder20 = await prisma.folder.create({
        data: {
            name: "Work pictures",
            description: "These are my work photos.",
            parentId: folder10.id,
        },
    });
    let folder21 = await prisma.folder.create({
        data: {
            name: "Holiday pictures",
            description: "These are my holiday photos.",
            parentId: folder10.id,
        },
    });
    let folder30 = await prisma.folder.create({
        data: {
            name: "Holiday pictures on the beach",
            description: "These are my holiday photos on a beach.",
            parentId: folder20.id,
        },
    });

    let folder1 = await prisma.folder.create({
        data: {
            name: "Documents",
            description: "These are some important documents",
        },
    });
    let folder2a = await prisma.folder.create({
        data: {
            name: "Personal documents",
            description: "These are personal documents.",
            parentId: folder1.id,
        },
    });
    let folder2b = await prisma.folder.create({
        data: {
            name: "Friends' documents",
            description: "These some documents of my friends.",
            parentId: folder1.id,
        },
    });
    let folder3 = await prisma.folder.create({
        data: {
            name: "Acquaintances' documents",
            description: "These some documents for my acquaintances.",
            parentId: folder2b.id,
        },
    });
}

async function resetFunction() {
    await deleteAllFolders();
    await addFolders();
}

// resetFunction();

async function deleteAllFolders() {
    await prisma.folder.deleteMany();
}

async function func() {
    // do this
    // let f = await prisma.folder.findMany({
    //     include: {
    //         children: {
    //             select: { id: true },
    //             orderBy: { name: "asc" },
    //         },
    //     },
    // });
    // console.log(f);
    // https://www.youtube.com/watch?v=7hZYh9qXxe4
    // const result = await prisma.$queryRaw`
    // WITH RECURSIVE top_down_folders AS
    // (
    // SELECT M."parentId", M."name", M."id" FROM "Folder" AS M WHERE M.NAME='Pictures'
    // UNION
    // SELECT f."parentId", f."name", f."id" FROM top_down_folders
    // INNER JOIN "Folder" AS f
    // ON top_down_folders."id" = f."parentId"
    // )
    // SELECT * FROM top_down_folders;
    // `;
    // console.log("raw query:");
    // console.log(result);
    // const result = await prisma.$queryRaw`
    // WITH RECURSIVE top_down_folders AS
    // (
    // SELECT M."parentId", M."id", 0 AS lvl FROM "Folder" AS M WHERE M."parentId" IS NULL
    // UNION
    // SELECT f."parentId", f."id", top_down_folders."lvl" + 1 AS lvl  FROM top_down_folders
    // INNER JOIN "Folder" AS f
    // ON top_down_folders."id" = f."parentId"
    // )
    // SELECT MAX(lvl) AS maxLevel FROM top_down_folders;
    // `;
    // console.log("raw query:");
    // console.log(result);
    // await prisma.folder.deleteMany();
}

// func();

async function getPathTo(id) {
    let folderPath = await prisma.$queryRaw`
    WITH RECURSIVE bottom_up AS
    (
    SELECT F."parentId", F."name", F."id" FROM "Folder" AS F WHERE F."id"=${id}
    UNION
    SELECT f."parentId", f."name", f."id" FROM bottom_up
    INNER JOIN "Folder" AS f
    ON bottom_up."parentId" = f."id"
    )
    SELECT * FROM bottom_up;
    `;
    folderPath.push({
        name: ROOT_FOLDER_NAME,
        id: ROOT_FOLDER_ID,
    });
    return folderPath.reverse();
}

async function getAllFolders() {
    return await prisma.folder.findMany({
        include: {
            children: {
                select: { id: true },
                orderBy: { name: "asc" },
            },
        },
        orderBy: { name: "asc" },
    });
}

async function getAllUsers() {
    return prisma.user.findMany();
}

// use prisma
async function addUser(user) {
    console.log("Inside addUser. User:");
    console.log(user);
    await prisma.user.create({
        data: {
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            password: user.hashedPassword,
        },
    });
}

async function getUserByField(fieldName, fieldValue) {
    const user = await prisma.user.findUnique({
        where: {
            [fieldName]: fieldValue,
        },
    });

    return user;
}

module.exports = {
    getAllUsers,
    getAllFolders,
    addUser,
    getUserByField,
    getPathTo,

    addFolders,
};

// async function getUserProfileInfo(userid) {
//     const { rows } = await pool.query(
//         `SELECT users.*, COUNT(posts.postid) AS postsCount
//         FROM users LEFT JOIN posts ON users.userid = posts.userid
//         WHERE users.userid = ${userid}
//         GROUP BY users.userid`
//     );
//     return rows[0];
// }

// async function makeUserMember(userid) {
//     await pool.query(
//         `UPDATE users
//         SET ismember = TRUE
//         WHERE userid = ${userid}`
//     );
// }

// async function requestUserAdmin(userid) {
//     await pool.query(
//         `UPDATE users
//         SET adminRequest = TRUE
//         WHERE userid = ${userid}`
//     );
// }

// async function addPost(post) {
//     await pool.query(
//         `INSERT INTO posts (title, text, postedOn, userId)
//                     VALUES ($1, $2, to_timestamp($3), $4)`,
//         [post.title, post.text, post.postedOn / 1000, post.userId]
//     );
// }

// async function getAllPosts() {
//     const { rows } = await pool.query(
//         "SELECT * FROM posts JOIN users ON posts.userId = users.userId ORDER BY postedOn DESC"
//     );
//     return rows;
// }

// async function getPost(postid) {
//     const { rows } = await pool.query(
//         `SELECT * FROM posts WHERE postid = ${postid}`
//     );
//     return rows[0];
// }

// async function deletePost(postid) {
//     await pool.query(`DELETE FROM posts WHERE postid = ${postid}`);
// }

// async function editPost(post) {
//     await pool.query(
//         `UPDATE posts
//         SET title = $1, text = $2, postedOn = to_timestamp($3)
//         WHERE postid = ${post.postid}`,
//         [post.title, post.text, post.postedOn / 1000]
//     );
// }
