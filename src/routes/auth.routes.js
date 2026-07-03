const express = require('express');
const { login, register, getMe, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
