const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Helper lấy userId dạng ObjectId an toàn
const getUserId = (req) => {
  return req.userId ? new mongoose.Types.ObjectId(req.userId) : null;
};

const setBudget = async (req, res) => {
  try {
    const { category, amount, limitAmount, month } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    const budgetMonth = month || new Date().toISOString().slice(0, 7);
    const finalAmount = Number(amount || limitAmount);

    if (isNaN(finalAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số tiền hạn mức không hợp lệ!' 
      });
    }

    if (category) {
      let budget = await Budget.findOneAndUpdate(
        { category, month: budgetMonth, user: userId },
        { amount: finalAmount, limitAmount: finalAmount },
        { upsert: true, new: true }
      );
      return res.status(200).json({
        success: true,
        message: 'Thiết lập ngân sách danh mục thành công!',
        data: budget
      });
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      { month: budgetMonth, category: { $exists: false }, user: userId },
      { limitAmount: finalAmount, amount: finalAmount, month: budgetMonth, user: userId },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedBudget,
      message: 'Cập nhật hạn mức ngân sách tổng thành công'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBudgets = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    const budgets = await Budget.find({ user: userId });
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const checkBudgetAlert = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });
    const currentMonth = req.query.month || new Date().toISOString().slice(0, 7);
    
    // Tìm hạn mức tổng của đúng USER
    const budget = await Budget.findOne({ 
      month: currentMonth, 
      category: { $exists: false },
      user: userId 
    });

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: { isExceeded: false, exceededBy: 0, limitAmount: 0, totalExpense: 0 },
        message: 'Chưa thiết lập ngân sách cho tháng này'
      });
    }

    const [year, monthNum] = currentMonth.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const expenseStats = await Transaction.aggregate([
      {
        $match: {
          user: userId, // 🔥 Chỉ lọc giao dịch của user này
          type: 'Chi',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpense = expenseStats.length > 0 ? expenseStats[0].totalExpense : 0;
    const limitAmount = budget.limitAmount || budget.amount || 0;
    const isExceeded = totalExpense > limitAmount;
    const exceededBy = isExceeded ? totalExpense - limitAmount : 0;

    return res.status(200).json({
      success: true,
      data: { isExceeded, exceededBy, limitAmount, totalExpense },
      message: 'Kiểm tra cảnh báo ngân sách thành công'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  setBudget,
  getBudgets,
  checkBudgetAlert
};