const express = require('express');
const { getStats } = require('../controllers/stats.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/', getStats);

module.exports = router;
