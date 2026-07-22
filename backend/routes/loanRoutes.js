const express = require('express');
const router = express.Router();
const Loan = require('../models/loanModel');
const protect = require('../middleware/authMiddleware');

// Lấy danh sách vay/mượn CỦA RIÊNG USER
router.get('/', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: loans, message: 'Lấy danh sách thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm khoản mới
router.post('/', protect, async (req, res) => {
  try {
    const newLoan = await Loan.create({
      ...req.body,
      user: req.userId
    });
    res.status(201).json({ success: true, data: newLoan, message: 'Thêm khoản ghi nhớ thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật trạng thái
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, 
      { status }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedLoan, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa khoản vay/mượn
router.delete('/:id', protect, async (req, res) => {
  try {
    await Loan.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;