const express = require('express');
const router = express.Router();
const CreditDebt = require('../models/creditDebtModel');

router.get('/', async (req, res) => {
  try {
    const debts = await CreditDebt.find();
    res.status(200).json({ success: true, data: debts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const newDebt = await CreditDebt.create(req.body);
    res.status(201).json({ success: true, data: newDebt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Thanh toán/Giảm dư nợ
router.put('/:id/pay', async (req, res) => {
  try {
    const { payAmount } = req.body;
    const item = await CreditDebt.findById(req.params.id);
    item.currentDebt = Math.max(0, item.currentDebt - Number(payAmount));
    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await CreditDebt.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;