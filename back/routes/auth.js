const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/user');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('fullName', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      fullName,
      email,
      password,
      userType,
      bloodType,
      organs,
      neededBloodType,
      neededOrgan
    } = req.body;

    try {
      let existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) return res.status(400).json({ errors: [{ msg: 'User already exists' }] });

      const newUser = new User({
        fullName,
        email: email.toLowerCase().trim(),
        password,
        userType,
        bloodType: userType === 'donor' ? bloodType : '',
        organs: userType === 'donor' ? organs : '',
        neededBloodType: userType === 'recipient' ? neededBloodType : '',
        neededOrgan: userType === 'recipient' ? neededOrgan : '',
        status: 'pending',
        isAdmin: false
      });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);

      await newUser.save();

      res.status(201).json({
        message: 'Registration submitted. Awaiting admin approval.'
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

      if (user.status !== 'approved') {
        return res.status(403).json({ error: 'Account pending admin approval' });
      }

      const payload = {
        user: {
          id: user.id,
          userType: user.userType,
          isAdmin: user.isAdmin
        }
      };

      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userType: user.userType,
          userId: user.id,
          userName: user.fullName,
          isAdmin: user.isAdmin
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/donor/info
// @desc    Get donor info
// @access  Private
router.get('/donor/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.userType !== 'donor') {
      return res.status(404).json({ msg: 'Donor not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
