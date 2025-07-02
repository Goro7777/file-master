const { ROOT_FOLDER, FOREIGN_FOLDER } = require("../utils/constants");
const dbFolder = require("../db/folder");
const dbFile = require("../db/file");

const getRootFolder = async (folders, userId) => {
    let rootFolder = { ...ROOT_FOLDER };

    let homeFiles = await dbFile.getAll(null, userId);
    rootFolder.files = homeFiles;

    rootFolder.children = folders.filter((folder) => !folder.parentId);
    let sharedFolder = await getForeignFolder(userId);
    rootFolder.children.push(sharedFolder);

    return rootFolder;
};

const getForeignFolder = async (userId) => {
    let { foreignFiles } = await dbFile.getForeign(userId);

    let sharedFolder = {
        ...FOREIGN_FOLDER,
        children: [],
        files: foreignFiles,
    };

    return sharedFolder;
};

async function getFolderPath(folderId) {
    let folderPath;
    if (folderId !== ROOT_FOLDER.id && folderId !== FOREIGN_FOLDER.id)
        folderPath = await dbFolder.getPath(folderId);
    else if (folderId === FOREIGN_FOLDER.id)
        folderPath = [{ ...FOREIGN_FOLDER }];
    else folderPath = [];
    folderPath.push({
        ...ROOT_FOLDER,
    });
    return folderPath.reverse();
}

module.exports = {
    getRootFolder,
    getForeignFolder,
    getFolderPath,
};
