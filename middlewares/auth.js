const checkAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("not authenticated");
        return res.redirect("/login");
    }
    return next();
};

module.exports = {
    checkAuth,
};
