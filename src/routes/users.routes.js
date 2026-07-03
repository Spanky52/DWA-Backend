const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/me', getProfile);
router.put('/me', updateProfile);

module.exports = router;
