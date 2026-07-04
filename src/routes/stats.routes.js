const express = require('express');
const { getStats, getDetailedStats, getWeeklyReport } = require('../controllers/stats.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/', getStats);
router.get('/detailed', getDetailedStats);
router.get('/weekly', getWeeklyReport);

module.exports = router;