require("dotenv").config();
const path = require("node:path");
const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma/client");
const passport = require("passport");

// change POST to DELETE?

const router = require("./routes/router");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    "/css",
    express.static(
        path.join(__dirname, "node_modules", "bootstrap", "dist", "css")
    )
);
app.use(
    "/bootstrap-icons",
    express.static(path.join(__dirname, "node_modules", "bootstrap-icons"))
);
app.use(
    "/js",
    express.static(
        path.join(__dirname, "node_modules", "bootstrap", "dist", "js")
    )
);

app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        },
        secret: process.env.FOO_COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(new PrismaClient(), {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);

require("./auth/passport");

app.use(passport.initialize());
app.use(passport.session());

// To make user available in all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use("/", router);

app.use((req, res) =>
    res.status(404).render("pages/error", {
        message: "404 Not Found: There is no such resource.",
    })
);

app.use((err, req, res, next) => {
    console.error(err);
    res.render("pages/error", {
        message: "An error occurred while processing your request.",
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});
