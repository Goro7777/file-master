const authChecker = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("not authenticated");
        return res.redirect("/login");
    }
    return next();
};

module.exports = {
    authChecker,
};
