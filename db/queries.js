const prisma = require("./config");
const { ROOT_FOLDER_ID } = require("../utils/constants");

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
    addFile,
    getFile,
    getFiles,
    getFileByName,
    getFilesNested,
    deleteFile,
};
