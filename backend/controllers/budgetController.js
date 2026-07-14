const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');

const setBudget = async (req, res) => {
  try {
    const { limitAmount, month } = req.body;

    const updatedBudget = await Budget.findOneAndUpdate(
      { month },
      { limitAmount, month },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedBudget,
      message: "Cập nhật hạn mức ngân sách thành công"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message
    });
  }
};

const checkBudgetAlert = async (req, res) => {
  try {
    const currentMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({ month: currentMonth });

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: { isExceeded: false, exceededBy: 0, limitAmount: 0, totalExpense: 0 },
        message: "Chưa thiết lập ngân sách cho tháng này"
      });
    }

    const [year, monthNum] = currentMonth.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const expenseStats = await Transaction.aggregate([
      {
        $match: {
          type: 'Chi',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" }
        }
      }
    ]);

    const totalExpense = expenseStats.length > 0 ? expenseStats[0].totalExpense : 0;
    const limitAmount = budget.limitAmount;
    const isExceeded = totalExpense > limitAmount;
    const exceededBy = isExceeded ? totalExpense - limitAmount : 0;

    return res.status(200).json({
      success: true,
      data: { isExceeded, exceededBy, limitAmount, totalExpense },
      message: "Kiểm tra cảnh báo ngân sách thành công"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message
    });
  }
};

module.exports = { setBudget, checkBudgetAlert };