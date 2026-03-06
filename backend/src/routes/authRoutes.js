const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, phoneNumber, email, password, fcmToken } = req.body;

    if (!name || !phoneNumber || !email || !password) {
      return res.status(400).json({ message: 'Name, phoneNumber, email and password are required' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }]
    });

    if (existing) {
      return res.status(409).json({ message: 'Email or phoneNumber already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phoneNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
      fcmToken: fcmToken || ''
    });

    const token = signToken(user._id);
    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        familyId: user.familyId,
        isApproved: user.isApproved,
        fcmToken: user.fcmToken
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        familyId: user.familyId,
        isApproved: user.isApproved,
        fcmToken: user.fcmToken
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
