const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  getDemoLoginStatus,
  demoLogin,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);
router.get('/demo-login', getDemoLoginStatus);
router.post('/demo-login', demoLogin);

module.exports = router;
