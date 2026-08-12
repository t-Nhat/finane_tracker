const express = require('express');
const router = express.Router();
const { setBudget, checkBudgetAlert } = require('../controllers/budgetController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, setBudget);
router.get('/check', protect, checkBudgetAlert);

module.exports = router;