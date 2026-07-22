const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/savingsGoalModel');
const protect = require('../middleware/authMiddleware');

// Lấy heo tiết kiệm CỦA RIÊNG USER
router.get('/', protect, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.userId });
    res.status(200).json({ success: true, data: goals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Tạo heo tiết kiệm
router.post('/', protect, async (req, res) => {
  try {
    const newGoal = await SavingsGoal.create({
      ...req.body,
      user: req.userId
    });
    res.status(201).json({ success: true, data: newGoal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Nạp tiền vào heo
router.put('/:id/deposit', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu!' });
    }

    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) goal.status = 'COMPLETED';
    await goal.save();
    
    res.status(200).json({ success: true, data: goal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Xóa heo tiết kiệm
router.delete('/:id', protect, async (req, res) => {
  try {
    await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;