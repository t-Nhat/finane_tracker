const express = require('express');
const router = express.Router();
const CreditDebt = require('../models/creditDebtModel');
const Transaction = require('../models/Transaction');
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
    const amount = Number(payAmount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền thanh toán không hợp lệ' });
    }

    const item = await CreditDebt.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ' });

    // 1. Tính tổng tài sản tiền mặt (cashBalance)
    const transactions = await Transaction.find({ user: req.userId });
    let cashBalance = 0;
    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      if (type === 'thu' || type === 'income') cashBalance += Number(t.amount || 0);
      else if (type === 'chi' || type === 'expense') cashBalance -= Number(t.amount || 0);
    });

    // 2. Kiểm tra nếu số tiền thanh toán lớn hơn số dư
    if (amount > cashBalance) {
      return res.status(400).json({ 
        success: false, 
        message: `Số dư khả dụng (${cashBalance.toLocaleString('vi-VN')} đ) không đủ để thanh toán khoản này.` 
      });
    }

    // 3. Tiến hành trừ nợ
    item.currentDebt = Math.max(0, item.currentDebt - amount);
    await item.save();

    // 4. Tạo giao dịch Chi để trừ tiền trong tài sản
    await Transaction.create({
      user: req.userId,
      type: 'Chi',
      category: 'Thanh toán nợ',
      amount: amount,
      note: `Thanh toán thẻ/nợ: ${item.name}`,
      date: new Date()
    });

    res.status(200).json({ success: true, data: item, message: 'Thanh toán thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await CreditDebt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;