const { supabase } = require("./config");

async function upload(username, fileName, fileId, buffer) {
    return await supabase.storage
        .from("uploads")
        .upload(username + "/" + fileName + "_" + fileId, buffer, {
            cacheControl: "3600",
            upsert: false,
        });
}

async function remove(username, files) {
    await supabase.storage
        .from("uploads")
        .remove(
            files.map((file) => username + "/" + file.name + "_" + file.id)
        );
}

module.exports = {
    upload,
    remove,
};
