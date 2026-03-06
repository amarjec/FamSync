const Family = require('../models/Family');

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user.familyId) {
      return res.status(400).json({ message: 'User is not part of a family' });
    }

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    if (family.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.family = family;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Authorization failed', error: error.message });
  }
};

module.exports = adminMiddleware;
