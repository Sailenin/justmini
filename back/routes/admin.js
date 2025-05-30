const express = require('express');
const router = express.Router();

const User = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/admin/pending-users
// @desc    Get list of pending users
// @access  Private/Admin
router.get('/pending-users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/admin/update-status/:userId
// @desc    Approve or reject user
// @access  Private/Admin
router.put('/update-status/:userId', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();

    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
