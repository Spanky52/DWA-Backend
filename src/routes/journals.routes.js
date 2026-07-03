const express = require('express');
const { createEntry, getEntries, updateEntry, deleteEntry } = require('../controllers/journal.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createEntry);
router.get('/', getEntries);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
