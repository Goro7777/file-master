const { supabase } = require("./config");

async function upload(username, fileName, buffer) {
    return await supabase.storage
        .from("uploads")
        .upload(username + "/" + fileName, buffer, {
            cacheControl: "3600",
            upsert: false,
        });
}

async function remove(username, fileNames) {
    await supabase.storage
        .from("uploads")
        .remove(fileNames.map((fileName) => username + "/" + fileName));
}

module.exports = {
    upload,
    remove,
};
