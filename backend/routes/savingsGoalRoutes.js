const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/savingsGoalModel');
const protect = require('../middleware/authMiddleware');

// Lấy heo tiết kiệm CỦA RIÊNG USER
router.get('/', protect, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.userId });
    
    // Tự động chuẩn hóa năm bị gõ thừa (ví dụ 20026 -> 2026)
    for (let g of goals) {
      if (g.deadline) {
        const d = new Date(g.deadline);
        if (d.getFullYear() > 2099) {
          d.setFullYear(2026);
          g.deadline = d;
          await SavingsGoal.updateOne({ _id: g._id }, { deadline: d });
        }
      }
    }

    res.status(200).json({ success: true, data: goals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Tạo heo tiết kiệm
router.post('/', protect, async (req, res) => {
  try {
    let body = { ...req.body, user: req.userId };
    if (body.deadline) {
      const d = new Date(body.deadline);
      if (isNaN(d.getTime()) || d.getFullYear() > 2099) {
        d.setFullYear(2026);
        body.deadline = d;
      }
    }
    const newGoal = await SavingsGoal.create(body);
    res.status(201).json({ success: true, data: newGoal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

const Transaction = require('../models/Transaction');

// Nạp tiền vào heo
router.put('/:id/deposit', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ!' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu!' });
    }

    // 🟢 KIỂM TRA SỐ DƯ KHẢ DỤNG TRONG VÍ CỦA USER
    const transactions = await Transaction.find({ user: req.userId });
    let cashBalance = 0;
    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amt = Number(t.amount || 0);
      if (type === 'thu' || type === 'income' || type === 'rút tiết kiệm') {
        cashBalance += amt;
      } else if (type === 'chi' || type === 'expense' || type === 'tiết kiệm') {
        cashBalance -= amt;
      }
    });

    if (numAmount > cashBalance) {
      return res.status(400).json({
        success: false,
        message: `⚠️ Số dư ví không đủ! Hiện tại bạn chỉ còn ${Math.max(0, cashBalance).toLocaleString('vi-VN')}đ khả dụng, không thể bỏ ${numAmount.toLocaleString('vi-VN')}đ vào heo.`
      });
    }

    goal.currentAmount += numAmount;
    if (goal.currentAmount >= goal.targetAmount) goal.status = 'COMPLETED';
    await goal.save();

    // 🟢 TỰ ĐỘNG TẠO GIAO DỊCH "TIẾT KIỆM" (Không tính vào Chi Tiêu hàng tháng)
    await Transaction.create({
      user: req.userId,
      type: 'Tiết kiệm',
      category: 'Bỏ heo tiết kiệm',
      amount: numAmount,
      date: new Date(),
      note: `Bỏ tiền vào heo: ${goal.goalName}`
    });
    
    res.status(200).json({ success: true, data: goal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Rút tiền từ heo
router.put('/:id/withdraw', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền rút không hợp lệ!' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu!' });
    }

    if (numAmount > goal.currentAmount) {
      return res.status(400).json({
        success: false,
        message: `⚠️ Số tiền trong heo không đủ! Bạn chỉ đang có ${goal.currentAmount.toLocaleString('vi-VN')}đ trong heo này.`
      });
    }

    goal.currentAmount -= numAmount;
    if (goal.currentAmount < goal.targetAmount) goal.status = 'IN_PROGRESS';
    await goal.save();

    // 🟢 TỰ ĐỘNG TẠO GIAO DỊCH "RÚT TIẾT KIỆM" (Không tính vào Thu Nhập hàng tháng)
    await Transaction.create({
      user: req.userId,
      type: 'Rút tiết kiệm',
      category: 'Rút tiền tiết kiệm',
      amount: numAmount,
      date: new Date(),
      note: `Rút tiền từ heo: ${goal.goalName}`
    });
    
    res.status(200).json({ success: true, data: goal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Xóa heo tiết kiệm (Hoàn lại toàn bộ tiền tích lũy vào ví)
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu!' });
    }

    const refundAmount = Number(goal.currentAmount || 0);

    // 🟢 NẾU TRONG HEO ĐANG CÓ TIỀN, TỰ ĐỘNG NẠP TRẢ LẠI TIỀN VÀO TÀI KHOẢN VÍ (TẠO GIAO DỊCH RÚT TIẾT KIỆM)
    if (refundAmount > 0) {
      await Transaction.create({
        user: req.userId,
        type: 'Rút tiết kiệm',
        category: 'Hoàn tiền tiết kiệm',
        amount: refundAmount,
        date: new Date(),
        note: `Hoàn tiền khi xóa heo tiết kiệm: ${goal.goalName}`
      });
    }

    await SavingsGoal.deleteOne({ _id: req.params.id, user: req.userId });

    res.status(200).json({ 
      success: true, 
      message: refundAmount > 0 
        ? `Đã xóa heo và hoàn ${refundAmount.toLocaleString('vi-VN')}đ về tài khoản ví của bạn!` 
        : 'Đã xóa mục tiêu tiết kiệm!' 
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;