const express = require('express');
const router = express.Router();
const Loan = require('../models/loanModel');

// Lấy danh sách vay/mượn
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: loans, message: 'Lấy danh sách thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm khoản mới
router.post('/', async (req, res) => {
  try {
    const newLoan = await Loan.create(req.body);
    res.status(201).json({ success: true, data: newLoan, message: 'Thêm khoản ghi nhớ thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật trạng thái (Đã trả / Chưa trả)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, data: updatedLoan, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa khoản vay/mượn
router.delete('/:id', async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;