// backend/controllers/dashboardController.js
const Transaction = require('../models/transactionModel');

// 1. Lấy thống kê thu chi tháng
const getMonthlyStats = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [year, monthNum] = currentMonth.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const stats = await Transaction.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
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

// 2. Lấy dữ liệu biểu đồ tròn
const getCategoryDataForChart = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [year, monthNum] = currentMonth.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const data = await Transaction.aggregate([
      { $match: { type: 'Chi', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $project: { category: "$_id", amount: 1, _id: 0 } }
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Lấy dòng tiền 14 ngày
const getCashflow14Days = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
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

// 4. Lấy dữ liệu Biến động thu chi (Cho Component mới)
const getFluctuationData = async (req, res) => {
  try {
    const { timeframe = 'thang', metric = 'chitieu' } = req.query;
    
    // Khung dữ liệu chuẩn để Frontend render không bị crash khi DB chưa có giao dịch
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

// EXPORT ĐỦ 4 HÀM NÀY KHÔNG THIẾU HÀM NÀO:
module.exports = {
  getMonthlyStats,
  getCategoryDataForChart,
  getCashflow14Days,
  getFluctuationData
};