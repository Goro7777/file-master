const { prisma } = require("./client");
const { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } = require("../utils/constants");

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
            folderId: folderId,
            ownerId: userId,
        },
        orderBy: {
            name: "asc",
        },
    });
}

async function getFilesNested(userId, folderId) {
    if (folderId === ROOT_FOLDER_ID) {
        return await prisma.file.findMany({
            select: {
                name: true,
                id: true,
            },
        });
    }

    let folders = await prisma.$queryRaw`
    WITH RECURSIVE top_down AS
    (
    SELECT F."name", F."id" FROM "Folder" AS F WHERE F."id"=${folderId}
    UNION
    SELECT f."name", f."id" FROM top_down 
    INNER JOIN "Folder" AS f 
    ON top_down."id" = f."parentId"
    ) 
    SELECT * FROM top_down;
    `;

    let files = [];
    for (let folder of folders) {
        let folderFiles = await getFiles(userId, folder.id);
        if (folderFiles.length) files.push(...folderFiles);
    }

    return files;
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

    return newFile;
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

async function deleteFile(userId, fileId) {
    await prisma.file.delete({
        where: {
            id: fileId,
            ownerId: userId,
        },
    });
}

module.exports = {
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
    getFilesNested,
    deleteFile,
};
