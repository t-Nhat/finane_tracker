const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/savingsGoalModel');

router.get('/', async (req, res) => {
  try {
    const goals = await SavingsGoal.find();
    res.status(200).json({ success: true, data: goals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const newGoal = await SavingsGoal.create(req.body);
    res.status(201).json({ success: true, data: newGoal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Nạp tiền vào heo
router.put('/:id/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findById(req.params.id);
    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) goal.status = 'COMPLETED';
    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;