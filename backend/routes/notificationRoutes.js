const express = require('express');
const router = express.Router();
const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');

router.get('/check', async (req, res) => {
  try {
    const alerts = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({ month: currentMonth });

    if (budget && budget.limitAmount > 0) {
      const [year, monthNum] = currentMonth.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);

      const expenseStats = await Transaction.aggregate([
        { $match: { type: 'Chi', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
      ]);

      const totalExpense = expenseStats.length > 0 ? expenseStats[0].totalExpense : 0;
      const percentUsed = Math.round((totalExpense / budget.limitAmount) * 100);

      if (totalExpense > budget.limitAmount) {
        alerts.push({
          id: 'exceeded',
          level: 'CRITICAL',
          title: '⚠️ VƯỢT HẠN MỨC CHI TIÊU',
          message: `Tháng này ông đã chi ${totalExpense.toLocaleString('vi-VN')} đ, vượt hạn mức ${budget.limitAmount.toLocaleString('vi-VN')} đ!`
        });
      } else if (percentUsed >= 80) {
        alerts.push({
          id: 'warning',
          level: 'WARNING',
          title: '⏰ SẮP ĐẠT HẠN MỨC',
          message: `Ông đã tiêu hết ${percentUsed}% ngân sách tháng này (${totalExpense.toLocaleString('vi-VN')} đ / ${budget.limitAmount.toLocaleString('vi-VN')} đ).`
        });
      }
    }

    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;