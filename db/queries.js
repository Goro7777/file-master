const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } = require("../utils/constants");

// users
async function addUser(user) {
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

async function getUniqueUserByField(fieldName, fieldValue) {
    const user = await prisma.user.findUnique({
        where: {
            [fieldName]: fieldValue,
        },
    });

    return user;
}

// folders
async function addFolder(folderData) {
    await prisma.folder.create({
        data: {
            name: folderData.name,
            description: folderData.description,
            parentId: folderData.parentId,
            ownerId: folderData.ownerId,
        },
    });
}

async function getAllFolders(userId) {
    return await prisma.folder.findMany({
        include: {
            children: {
                select: { id: true },
                orderBy: { name: "asc" },
            },
        },
        where: {
            ownerId: userId,
        },
        orderBy: { name: "asc" },
    });
}

async function getFolderByFieldsCI(entries) {
    let conditions = {};
    for (let [key, value] of entries) {
        conditions[key] = {
            equals: value,
            mode: "insensitive",
        };
    }
    return await prisma.folder.findFirst({
        where: conditions,
    });
}

async function getFolderPathTo(id) {
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

module.exports = {
    addUser,
    getUniqueUserByField,

    addFolder,
    getAllFolders,
    getFolderByFieldsCI,
    getFolderPathTo,
};

async function resetFunction() {
    await prisma.user.deleteMany();
    await deleteAllFolders();
    // await addFolders();
}

async function deleteAllFolders() {
    await prisma.folder.deleteMany();
}

async function func() {
    let f = await prisma.folder.findMany({
        include: {
            children: {
                select: { id: true },
                orderBy: { name: "asc" },
            },
        },
    });
    console.log(f);

    // https://www.youtube.com/watch?v=7hZYh9qXxe4
    const result = await prisma.$queryRaw`
    WITH RECURSIVE top_down_folders AS
    (
    SELECT M."parentId", M."name", M."id" FROM "Folder" AS M WHERE M.NAME='Pictures'
    UNION
    SELECT f."parentId", f."name", f."id" FROM top_down_folders
    INNER JOIN "Folder" AS f
    ON top_down_folders."id" = f."parentId"
    )
    SELECT * FROM top_down_folders;
    `;
    console.log("raw query:");
    console.log(result);

    const result2 = await prisma.$queryRaw`
    WITH RECURSIVE top_down_folders AS
    (
    SELECT M."parentId", M."id", 0 AS lvl FROM "Folder" AS M WHERE M."parentId" IS NULL
    UNION
    SELECT f."parentId", f."id", top_down_folders."lvl" + 1 AS lvl  FROM top_down_folders
    INNER JOIN "Folder" AS f
    ON top_down_folders."id" = f."parentId"
    )
    SELECT MAX(lvl) AS maxLevel FROM top_down_folders;
    `;
    console.log("raw query:");
    console.log(result2);
    await prisma.folder.deleteMany();
}
