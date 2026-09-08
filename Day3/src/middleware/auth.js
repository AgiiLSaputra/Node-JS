const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.session.error = "Please login first";
  res.redirect("/auth/login");
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.session.error = "Access denied. Admin only.";
  res.redirect("/auth/login");
};

module.exports = { isAuthenticated, isAdmin };
