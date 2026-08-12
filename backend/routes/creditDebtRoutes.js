const express = require('express');
const router = express.Router();
const CreditDebt = require('../models/creditDebtModel');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const debts = await CreditDebt.find({ user: req.userId });
    res.status(200).json({ success: true, data: debts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const newDebt = await CreditDebt.create({ ...req.body, user: req.userId });
    res.status(201).json({ success: true, data: newDebt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Thanh toán/Giảm dư nợ
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { payAmount } = req.body;
    const item = await CreditDebt.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ' });
    item.currentDebt = Math.max(0, item.currentDebt - Number(payAmount));
    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await CreditDebt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;