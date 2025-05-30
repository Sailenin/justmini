const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

module.exports = function (req, res, next) {
  // Get token from headers
  const token = req.header('x-auth-token');

  // If no token, deny access
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded.user;

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
};
