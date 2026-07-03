const express = require('express');
const { createChallenge, getChallenges, updateChallenge, deleteChallenge } = require('../controllers/challenge.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createChallenge);
router.get('/', getChallenges);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

module.exports = router;
