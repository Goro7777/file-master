const { PrismaClient, Prisma } = require("../generated/prisma");
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
    let newFolder = await prisma.folder.create({
        data: {
            name: folderData.name,
            description: folderData.description,
            owner: {
                connect: {
                    id: folderData.ownerId,
                },
            },
        },
    });

    if (folderData.parentId) {
        await prisma.folder.update({
            where: {
                id: folderData.parentId,
            },
            data: {
                children: {
                    connect: {
                        id: newFolder.id,
                    },
                },
            },
        });
    }
}

async function updateFolder(folderData) {
    await prisma.folder.update({
        where: {
            id: folderData.id,
        },
        data: {
            name: folderData.name,
            description: folderData.description,
        },
    });
}

async function deleteFolder(folderId) {
    await prisma.folder.delete({
        where: {
            id: folderId,
        },
    });
}

async function getAllFolders(userId) {
    // await prisma.folder.deleteMany();
    // await prisma.file.deleteMany();

    return await prisma.folder.findMany({
        include: {
            children: {
                select: { id: true },
                orderBy: { name: "asc" },
            },
            files: {
                orderBy: { name: "asc" },
            },
        },
        where: {
            ownerId: userId,
        },
        orderBy: { name: "asc" },
    });
}

async function getFolderByFieldsCI(fields) {
    let conditions = {};
    for (let [key, value] of fields) {
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

// files
async function getFile(userId, fileId) {
    return await prisma.file.findFirst({
        where: {
            ownerId: userId,
            id: fileId,
        },
    });
}

async function getFiles(userId, folderId) {
    return await prisma.file.findMany({
        where: {
            folderId,
            ownerId: userId,
        },
        orderBy: {
            name: "asc",
        },
    });
}

async function addFile(fileData) {
    let newFile = await prisma.file.create({
        data: {
            name: fileData.name,
            description: fileData.description,
            size: fileData.size,
            mimeType: fileData.mimeType,
            url: fileData.url,
            owner: {
                connect: {
                    id: fileData.ownerId,
                },
            },
        },
    });

    if (fileData.folderId) {
        await prisma.folder.update({
            where: {
                id: fileData.folderId,
            },
            data: {
                files: {
                    connect: {
                        id: newFile.id,
                    },
                },
            },
        });
    }
}

async function getFileByName(userId, folderId, fileName) {
    return await prisma.file.findFirst({
        where: {
            ownerId: userId,
            folderId: folderId,
            name: fileName,
        },
    });
}

module.exports = {
    addUser,
    getUniqueUserByField,

    addFolder,
    updateFolder,
    deleteFolder,
    getAllFolders,
    getFolderByFieldsCI,
    getFolderPathTo,

    addFile,
    getFile,
    getFiles,
    getFileByName,
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
