const prisma = require("./config");

async function add(user) {
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

async function get(id) {
    return await prisma.user.findUnique({
        where: {
            id: id,
        },
    });
}

async function getByUsername(username) {
    return await prisma.user.findUnique({
        where: {
            username: username,
        },
    });
}

async function getByEmail(email) {
    return await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
}

module.exports = {
    get,
    getByUsername,
    getByEmail,
    add,
};
