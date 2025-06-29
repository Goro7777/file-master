const prisma = require("./config");

async function get(folderId) {
    return prisma.folder.findUnique({
        where: {
            id: folderId,
        },
    });
}

async function getAll(userId) {
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

async function getPath(folderId) {
    return await prisma.$queryRaw`
        WITH RECURSIVE bottom_up AS
        (
        SELECT F."parentId", F."name", F."id" FROM "Folder" AS F WHERE F."id"=${folderId}
        UNION
        SELECT f."parentId", f."name", f."id" FROM bottom_up
        INNER JOIN "Folder" AS f
        ON bottom_up."parentId" = f."id"
        )
        SELECT * FROM bottom_up;
    `;
}

async function add(folderData) {
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

async function update(folderData) {
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

async function remove(folderId) {
    await prisma.folder.delete({
        where: {
            id: folderId,
        },
    });
}

async function hasChildName(folderId, childName) {
    let child = await prisma.folder.findFirst({
        where: {
            parentId: folderId,
            name: childName,
        },
    });

    return child ? true : false;
}

module.exports = {
    get,
    getAll,
    getPath,
    add,
    update,
    remove,
    hasChildName,
};
