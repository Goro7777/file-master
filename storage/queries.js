const { supabase } = require("./config");

async function upload(user, file) {
    return await supabase.storage
        .from("uploads")
        .upload(user.username + "/" + file.originalname, file.buffer, {
            cacheControl: "3600",
            upsert: false,
        });
}

module.exports = {
    upload,
};
