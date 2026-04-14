const authorizeRoles = (...roles) => {
  const allowedRoles = roles.map((role) => String(role).toUpperCase());
  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = authorizeRoles;
