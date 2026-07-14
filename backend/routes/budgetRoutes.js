const express = require('express');
const router = express.Router();
const { setBudget, checkBudgetAlert } = require('../controllers/budgetController');

router.post('/', setBudget);
router.get('/check', checkBudgetAlert);

module.exports = router;