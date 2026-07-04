const express = require('express');
const {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
  getHabitStats,
} = require('../controllers/habit.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/toggle', toggleHabitCompletion);
router.get('/:id/stats', getHabitStats);

module.exports = router;