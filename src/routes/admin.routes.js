const express = require('express');
const { getOverview, getUsers, getUserById, getLogs } = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const authorizeAdmin = require('../middleware/admin.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);
router.get('/overview', getOverview);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/logs', getLogs);

module.exports = router;
