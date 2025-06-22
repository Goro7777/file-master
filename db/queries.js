const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getAllUsers() {
    return prisma.user.findMany();
}
//   username  String   @unique
//   email     String   @unique
//   firstname String
//   lastname  String
//   password  String

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

// async function addUserOld(user) {
//     await pool.query(
//         `INSERT INTO users (username, firstname, lastname, email, password, joinedOn)
//                     VALUES ($1, $2, $3, $4, $5, to_timestamp($6))`,
//         [
//             user.username,
//             user.firstname,
//             user.lastname,
//             user.email,
//             user.hashedPassword,
//             user.joinedOn / 1000,
//         ]
//     );
// }

// async function getAllUsers() {
//     const { rows } = await pool.query(
//         "SELECT * FROM users ORDER BY joinedOn DESC"
//     );
//     return rows;
// }

// use prisma
// async function getUserByFieldOld(fieldName, fieldValue) {
//     const { rows } = await pool.query(
//         `SELECT * FROM users WHERE ${fieldName} = '${fieldValue}'`
//     );
//     return rows[0];
// }

async function getUserByField(fieldName, fieldValue) {
    const user = await prisma.user.findUnique({
        where: {
            [fieldName]: fieldValue,
        },
    });

    return user;
}

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

module.exports = {
    getAllUsers,
    addUser,
    // getAllUsers,
    getUserByField,
    // getUserProfileInfo,
    // makeUserMember,
    // requestUserAdmin,

    // addPost,
    // getAllPosts,
    // getPost,
    // deletePost,
    // editPost,
};
