const express = require('express');
const { getProfile, updateProfile, changePassword, updatePreferences } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/password', changePassword);
router.put('/me/preferences', updatePreferences);

module.exports = router;