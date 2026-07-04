const express = require('express');
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  updateProgress,
  getUserChallenges,
} = require('../controllers/challenge.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createChallenge);
router.get('/', getChallenges);
router.get('/my', getUserChallenges);
router.get('/:id', getChallengeById);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);
router.post('/:id/join', joinChallenge);
router.patch('/:id/progress', updateProgress);

module.exports = router;