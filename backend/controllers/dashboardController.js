const Transaction = require('../models/Transaction');
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

    const aggregatedData = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          type: 'Chi', 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $project: { category: "$_id", amount: 1, _id: 0 } },
      { $sort: { amount: -1 } }
    ]);

    // Chuyển đổi dữ liệu sang định dạng mà Chart.js ở frontend cần
    const labels = aggregatedData.map(item => item.category || 'Chưa phân loại');
    const values = aggregatedData.map(item => item.amount);

    res.status(200).json({ success: true, data: { labels, values } });
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
      dateMap[dateStr] = { date: dateStr, thu: 0, chi: 0 };
    }

    transactions.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (dateMap[dateStr]) {
        if (t.type === 'Thu') dateMap[dateStr].thu += t.amount;
        if (t.type === 'Chi') dateMap[dateStr].chi += t.amount;
      }
    });

    res.status(200).json({ success: true, data: Object.values(dateMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFluctuationData = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

        const { metric = 'chitieu', timeframe = 'thang' } = req.query;

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        let startDate, getPeriodIndex;
        const labels = [];
        const currentData = Array(7).fill(0);
        const previousData = Array(7).fill(0);

        if (timeframe === 'tuan') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 97); // 14 weeks
            startDate.setHours(0, 0, 0, 0);
            
            const getWeekStart = (d) => {
                const date = new Date(d);
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                date.setHours(0,0,0,0);
                return new Date(date.setDate(diff));
            };
            const currentWeekStart = getWeekStart(today);

            getPeriodIndex = (tDate) => {
                const transactionWeekStart = getWeekStart(tDate);
                const diffTime = currentWeekStart - transactionWeekStart;
                return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            };

            for (let i = 6; i >= 0; i--) {
                const d = new Date(currentWeekStart);
                d.setDate(d.getDate() - (i * 7));
                labels.push(i === 0 ? 'Tuần này' : `W${d.getDate()}/${d.getMonth()+1}`);
            }
        } else if (timeframe === 'nam') {
            startDate = new Date(today.getFullYear() - 13, 0, 1); // 14 years
            getPeriodIndex = (tDate) => today.getFullYear() - tDate.getFullYear();
            for (let i = 6; i >= 0; i--) {
                labels.push(i === 0 ? 'Năm nay' : `${today.getFullYear() - i}`);
            }
        } else { // 'thang'
            startDate = new Date(today.getFullYear(), today.getMonth() - 13, 1); // 14 months
            getPeriodIndex = (tDate) => (today.getFullYear() - tDate.getFullYear()) * 12 + (today.getMonth() - tDate.getMonth());
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                labels.push(i === 0 ? 'Kỳ này' : `T${d.getMonth() + 1}`);
            }
        }

        const transactionType = metric === 'thunhap' ? 'Thu' : 'Chi';
        const transactions = await Transaction.find({
            user: userId,
            ...(metric !== 'chenhlech' && { type: transactionType }),
            date: { $gte: startDate, $lte: today }
        });

        transactions.forEach(t => {
            const periodDiff = getPeriodIndex(new Date(t.date));
            let value = (metric === 'chenhlech' && t.type === 'Chi') ? -t.amount : t.amount;

            if (periodDiff >= 0 && periodDiff < 7) {
                currentData[6 - periodDiff] += value;
            } else if (periodDiff >= 7 && periodDiff < 14) {
                previousData[13 - periodDiff] += value;
            }
        });

        const totalAmount = currentData.reduce((sum, val) => sum + val, 0);
        const diffAmount = currentData[6] - currentData[5];

        res.status(200).json({ success: true, data: { labels, currentData, previousData, totalAmount, diffAmount } });
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