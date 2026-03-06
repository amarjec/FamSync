const approvedMiddleware = (req, res, next) => {
  if (!req.user || req.user.isApproved !== true) {
    return res.status(403).json({ message: 'User is not approved yet' });
  }

  return next();
};

module.exports = approvedMiddleware;
