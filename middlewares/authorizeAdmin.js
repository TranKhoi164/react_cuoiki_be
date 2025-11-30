function authorizeAdmin(req, res, next) {
  const roleHeader = req.header("x-user-role");

  if (Number(roleHeader) !== 1) {
    return res.status(403).json({
      message: "Admin privileges required"
    });
  }

  return next();
}

module.exports = authorizeAdmin;

