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

// split into getByUsername, getByEmail, getById
async function getUniqueByField(fieldName, fieldValue) {
    const user = await prisma.user.findUnique({
        where: {
            [fieldName]: fieldValue,
        },
    });

    return user;
}

module.exports = {
    add,
    getUniqueByField,
};
