const prisma = require("./config");
const dbFolder = require("./folder");

async function get(fileId, userId) {
    return await prisma.file.findFirst({
        where: {
            ownerId: userId,
            id: fileId,
        },
    });
}

async function getByName(folderId, fileName, userId) {
    return await prisma.file.findFirst({
        where: {
            ownerId: userId,
            folderId: folderId,
            name: fileName,
        },
    });
}

async function getAll(folderId, userId) {
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

async function getForeign(userId) {
    return await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            foreignFiles: true,
        },
    });
}

async function getAllNested(folderId, userId) {
    if (!folderId) {
        return await prisma.file.findMany({
            select: {
                name: true,
                id: true,
            },
            where: {
                ownerId: userId,
            },
        });
    }

    let folders = await dbFolder.getAllNested(folderId);
    let files = [];
    for (let folder of folders) {
        let folderFiles = await getAll(userId, folder.id);
        if (folderFiles.length) files.push(...folderFiles);
    }

    return files;
}

async function add(fileData) {
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

async function remove(fileId, userId) {
    await prisma.file.delete({
        where: {
            id: fileId,
            ownerId: userId,
        },
    });
}

async function share(fileId, foreignUsername, userId) {
    await prisma.file.update({
        where: {
            id: fileId,
            ownerId: userId,
        },
        data: {
            sharedWith: { set: [{ username: foreignUsername }] },
        },
    });
}

module.exports = {
    get,
    getByName,
    getAll,
    getForeign,
    getAllNested,
    add,
    remove,
    share,
};
