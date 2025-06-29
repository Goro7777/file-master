const { prisma } = require("./client");

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
