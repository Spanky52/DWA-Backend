const express = require('express');
const { createHabit, getHabits, updateHabit, deleteHabit } = require('../controllers/habit.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createHabit);
router.get('/', getHabits);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
