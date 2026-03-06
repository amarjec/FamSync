const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Family = require('../models/Family');
const User = require('../models/User');
const generateUniqueInviteCode = require('../utils/generateInviteCode');
const sendNotification = require('../utils/sendNotification');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { familyName } = req.body;
    if (!familyName) {
      return res.status(400).json({ message: 'familyName is required' });
    }

    if (req.user.familyId) {
      return res.status(400).json({ message: 'User is already linked to a family' });
    }

    const inviteCode = await generateUniqueInviteCode();

    const family = await Family.create({
      familyName,
      adminId: req.user._id,
      inviteCode
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { familyId: family._id, isApproved: true },
      { new: true }
    ).select('-password');

    return res.status(201).json({ family, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Family creation failed', error: error.message });
  }
});

router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: 'inviteCode is required' });
    }

    if (req.user.familyId) {
      return res.status(400).json({ message: 'User already belongs to a family' });
    }

    const family = await Family.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { familyId: family._id, isApproved: false },
      { new: true }
    ).select('-password');

    const adminUser = await User.findById(family.adminId);
    await sendNotification({
      token: adminUser?.fcmToken,
      title: 'New Family Join Request',
      body: `New join request from ${updatedUser.name}`
    });

    return res.json({
      message: 'Join request submitted. Waiting for admin approval.',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'Join request failed', error: error.message });
  }
});

router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingUsers = await User.find({
      familyId: req.family._id,
      isApproved: false
    }).select('-password');

    return res.json({ pendingUsers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch pending users', error: error.message });
  }
});

router.put('/approve/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userToApprove = await User.findOne({
      _id: req.params.userId,
      familyId: req.family._id
    });

    if (!userToApprove) {
      return res.status(404).json({ message: 'User not found in your family' });
    }

    userToApprove.isApproved = true;
    await userToApprove.save();

    await sendNotification({
      token: userToApprove.fcmToken,
      title: 'Request Approved',
      body: 'Your request was approved!'
    });

    return res.json({ message: 'User approved', user: userToApprove });
  } catch (error) {
    return res.status(500).json({ message: 'Approval failed', error: error.message });
  }
});

router.put('/reject/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userToReject = await User.findOne({
      _id: req.params.userId,
      familyId: req.family._id,
      isApproved: false
    });

    if (!userToReject) {
      return res.status(404).json({ message: 'Pending user not found in your family' });
    }

    userToReject.familyId = null;
    userToReject.isApproved = false;
    await userToReject.save();

    await sendNotification({
      token: userToReject.fcmToken,
      title: 'Request Rejected',
      body: 'Your family join request was rejected.'
    });

    return res.json({ message: 'User rejected and unlinked from family' });
  } catch (error) {
    return res.status(500).json({ message: 'Reject failed', error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const family = req.user.familyId ? await Family.findById(req.user.familyId) : null;
    return res.json({ user: req.user, family });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch family profile', error: error.message });
  }
});

router.get('/members/approved', authMiddleware, async (req, res) => {
  try {
    if (!req.user.familyId) {
      return res.json({ members: [] });
    }

    const members = await User.find({
      familyId: req.user.familyId,
      isApproved: true
    }).select('_id name phoneNumber email isApproved');

    return res.json({ members });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch approved members', error: error.message });
  }
});

module.exports = router;
