const express = require('express');
const router = express.Router();
const Loan = require('../models/loanModel');
const CreditDebt = require('../models/creditDebtModel');

// API lấy toàn bộ cảnh báo khẩn cấp
router.get('/check', async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    // 1. Quét các khoản vay/mượn cá nhân sắp đến hạn hoặc quá hạn
    const pendingLoans = await Loan.find({ status: 'PENDING' });
    
    pendingLoans.forEach(loan => {
      if (loan.dueDate) {
        const dueDate = new Date(loan.dueDate);
        const actionText = loan.type === 'LEND' ? 'thu hồi tiền cho mượn từ' : 'thanh toán nợ cho';
        
        if (dueDate < now) {
          alerts.push({
            id: loan._id,
            level: 'CRITICAL',
            title: '⚠️ ĐÃ QUÁ HẠN THANH TOÁN',
            message: `Khoản ${actionText} [${loan.personName}] trị giá ${loan.amount.toLocaleString('vi-VN')} đ đã quá hạn!`
          });
        } else if (dueDate <= threeDaysLater) {
          alerts.push({
            id: loan._id,
            level: 'WARNING',
            title: '⏰ SẮP ĐẾN HẠN TRẢ NỢ',
            message: `Còn dưới 3 ngày để ${actionText} [${loan.personName}]: ${loan.amount.toLocaleString('vi-VN')} đ.`
          });
        }
      }
    });

    // 2. Quét thẻ tín dụng và vay tổ chức
    const currentDay = now.getDate();
    const activeDebts = await CreditDebt.find({ currentDebt: { $gt: 0 } });

    activeDebts.forEach(debt => {
      if (debt.dueDateDay) {
        const diffDay = debt.dueDateDay - currentDay;
        if (diffDay >= 0 && diffDay <= 3) {
          alerts.push({
            id: debt._id,
            level: 'WARNING',
            title: '💳 ĐẾN NGÀY CHỐT THẺ',
            message: `Khoản [${debt.name}] đến hạn thanh toán ngày ${debt.dueDateDay} hàng tháng. Dư nợ: ${debt.currentDebt.toLocaleString('vi-VN')} đ.`
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      data: alerts,
      message: 'Kiểm tra thông báo nhắc nhở thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;