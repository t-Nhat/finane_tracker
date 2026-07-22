const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');

// Helper lấy userId dạng ObjectId an toàn
const getUserId = (req) => {
  return req.userId ? new mongoose.Types.ObjectId(req.userId) : null;
};

const getSummary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    // Lọc giao dịch thuộc riêng user
    const transactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === 'Thu') {
        totalIncome += t.amount;
      } else if (t.type === 'Chi') {
        totalExpense += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê thành công',
      data: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const getMonthlyStats = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [year, monthNum] = currentMonth.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const stats = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    stats.forEach(item => {
      if (item._id === 'Thu') totalIncome = item.total;
      if (item._id === 'Chi') totalExpense = item.total;
    });

    res.status(200).json({
      success: true,
      data: { totalIncome, totalExpense, balance: totalIncome - totalExpense }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryDataForChart = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [year, monthNum] = currentMonth.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const data = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          type: 'Chi', 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $project: { category: "$_id", amount: 1, _id: 0 } }
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCashflow14Days = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: fourteenDaysAgo }
    }).sort({ date: 1 });

    const dateMap = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      dateMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (dateMap[dateStr]) {
        if (t.type === 'Thu') dateMap[dateStr].income += t.amount;
        if (t.type === 'Chi') dateMap[dateStr].expense += t.amount;
      }
    });

    res.status(200).json({ success: true, data: Object.values(dateMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFluctuationData = async (req, res) => {
  try {
    const resData = {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Kỳ này'],
      currentData: [0, 0, 0, 0, 0, 0, 0],
      previousData: [0, 0, 0, 0, 0, 0, 0],
      totalAmount: 0,
      diffAmount: 0
    };

    res.status(200).json({ success: true, data: resData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSummary,
  getMonthlyStats,
  getCategoryDataForChart,
  getCashflow14Days,
  getFluctuationData
};