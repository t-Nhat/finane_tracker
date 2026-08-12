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

    const now = new Date();
    const targetYear = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    const monthQuery = req.query.month;

    let startDate, endDate;
    if (!monthQuery || monthQuery === 'all') {
      startDate = new Date(targetYear, 0, 1, 0, 0, 0);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    } else {
      const monthNum = parseInt(monthQuery);
      startDate = new Date(targetYear, monthNum - 1, 1, 0, 0, 0);
      endDate = new Date(targetYear, monthNum, 0, 23, 59, 59);
    }

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

    const type = req.query.type === 'Thu' ? 'Thu' : 'Chi';
    const now = new Date();
    const targetYear = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    const targetMonth = req.query.month ? parseInt(req.query.month) - 1 : now.getMonth();

    const startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // 1. Tính tổng Chi tiêu trong tháng
    const expenseAgg = await Transaction.aggregate([
      { $match: { user: userId, type: 'Chi', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    // 2. Tính tổng Thu nhập trong tháng
    const incomeAgg = await Transaction.aggregate([
      { $match: { user: userId, type: 'Thu', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;

    // 3. Gom nhóm theo danh mục đối với loại được chọn ('Chi' hoặc 'Thu')
    const aggregatedData = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          type: type, 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $project: { category: "$_id", amount: 1, _id: 0 } },
      { $sort: { amount: -1 } }
    ]);

    const labels = aggregatedData.map(item => item.category || 'Chưa phân loại');
    const values = aggregatedData.map(item => item.amount);

    res.status(200).json({ 
      success: true, 
      data: { 
        totalExpense,
        totalIncome,
        labels, 
        values,
        month: targetMonth + 1,
        year: targetYear
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCashflow14Days = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực người dùng!' });

    const now = new Date();
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    const monthQuery = req.query.month;

    if (!monthQuery || monthQuery === 'all') {
      // Trả về 12 tháng trong năm
      const startDate = new Date(year, 0, 1, 0, 0, 0);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const transactions = await Transaction.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const monthMap = {};
      for (let m = 1; m <= 12; m++) {
        const monthLabel = `T${m}/${year}`;
        monthMap[m] = { date: monthLabel, thu: 0, chi: 0 };
      }

      transactions.forEach(t => {
        const d = new Date(t.date);
        const m = d.getMonth() + 1;
        if (monthMap[m]) {
          if (t.type === 'Thu') monthMap[m].thu += t.amount;
          if (t.type === 'Chi') monthMap[m].chi += t.amount;
        }
      });

      return res.status(200).json({ success: true, data: Object.values(monthMap) });
    }

    // Chọn tháng cụ thể trong năm
    const month = parseInt(monthQuery) - 1; // 0-indexed
    const startDate = new Date(year, month, 1, 0, 0, 0);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const dateMap = {};
    const monthStr = String(month + 1).padStart(2, '0');
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      const dateKey = `${dayStr}/${monthStr}`;
      dateMap[dateKey] = { date: dateKey, thu: 0, chi: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const dayStr = String(d.getDate()).padStart(2, '0');
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dateKey = `${dayStr}/${mStr}`;
      if (dateMap[dateKey]) {
        if (t.type === 'Thu') dateMap[dateKey].thu += t.amount;
        if (t.type === 'Chi') dateMap[dateKey].chi += t.amount;
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
    const now = new Date();

    const transactions = await Transaction.find({ user: userId });

    const labels = [];
    const currentData = Array(7).fill(0);
    const previousData = Array(7).fill(0);

    if (timeframe === 'tuan') {
      // 7 tuần kết thúc ở tuần này
      for (let i = 6; i >= 0; i--) {
        if (i === 0) labels.push('Tuần này');
        else if (i === 1) labels.push('Tuần trước');
        else labels.push(`${i} tuần trước`);
      }

      transactions.forEach(t => {
        const d = new Date(t.date || t.createdAt);
        if (isNaN(d.getTime())) return;

        const diffTime = now - d;
        if (diffTime < 0) return;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);

        let amount = Number(t.amount || 0);
        const tType = (t.type || '').toLowerCase();

        let isMatch = false;
        let value = 0;

        if (metric === 'chitieu' && (tType === 'chi' || tType === 'expense')) {
          isMatch = true;
          value = amount;
        } else if (metric === 'thunhap' && (tType === 'thu' || tType === 'income')) {
          isMatch = true;
          value = amount;
        } else if (metric === 'chenhlech') {
          if (tType === 'thu' || tType === 'income') {
            isMatch = true;
            value = amount;
          } else if (tType === 'chi' || tType === 'expense') {
            isMatch = true;
            value = -amount;
          }
        }

        if (isMatch) {
          if (weekIndex >= 0 && weekIndex < 7) {
            currentData[6 - weekIndex] += value;
          } else if (weekIndex >= 7 && weekIndex < 14) {
            previousData[13 - weekIndex] += value;
          }
        }
      });

    } else if (timeframe === 'nam') {
      const currentYear = now.getFullYear();
      for (let i = 6; i >= 0; i--) {
        labels.push(i === 0 ? 'Năm nay' : `${currentYear - i}`);
      }

      transactions.forEach(t => {
        const d = new Date(t.date || t.createdAt);
        if (isNaN(d.getTime())) return;

        const yearDiff = currentYear - d.getFullYear();
        let amount = Number(t.amount || 0);
        const tType = (t.type || '').toLowerCase();

        let isMatch = false;
        let value = 0;

        if (metric === 'chitieu' && (tType === 'chi' || tType === 'expense')) {
          isMatch = true;
          value = amount;
        } else if (metric === 'thunhap' && (tType === 'thu' || tType === 'income')) {
          isMatch = true;
          value = amount;
        } else if (metric === 'chenhlech') {
          if (tType === 'thu' || tType === 'income') {
            isMatch = true;
            value = amount;
          } else if (tType === 'chi' || tType === 'expense') {
            isMatch = true;
            value = -amount;
          }
        }

        if (isMatch) {
          if (yearDiff >= 0 && yearDiff < 7) {
            currentData[6 - yearDiff] += value;
          } else if (yearDiff >= 7 && yearDiff < 14) {
            previousData[13 - yearDiff] += value;
          }
        }
      });

    } else { // 'thang' - 7 tháng gần nhất
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        labels.push(i === 0 ? 'Tháng này' : `T${d.getMonth() + 1}`);
      }

      transactions.forEach(t => {
        const d = new Date(t.date || t.createdAt);
        if (isNaN(d.getTime())) return;

        const monthDiff = (currentYear - d.getFullYear()) * 12 + (currentMonth - d.getMonth());
        let amount = Number(t.amount || 0);
        const tType = (t.type || '').toLowerCase();

        let isMatch = false;
        let value = 0;

        if (metric === 'chitieu' && (tType === 'chi' || tType === 'expense')) {
          isMatch = true;
          value = amount;
        } else if (metric === 'thunhap' && (tType === 'thu' || tType === 'income')) {
          isMatch = true;
          value = amount;
        } else if (metric === 'chenhlech') {
          if (tType === 'thu' || tType === 'income') {
            isMatch = true;
            value = amount;
          } else if (tType === 'chi' || tType === 'expense') {
            isMatch = true;
            value = -amount;
          }
        }

        if (isMatch) {
          if (monthDiff >= 0 && monthDiff < 7) {
            currentData[6 - monthDiff] += value;
          } else if (monthDiff >= 7 && monthDiff < 14) {
            previousData[13 - monthDiff] += value;
          }
        }
      });
    }

    const totalAmount = currentData.reduce((sum, v) => sum + v, 0);
    const prevPeriodTotal = previousData.reduce((sum, v) => sum + v, 0);
    const hasPrevData = previousData.some(v => v !== 0);
    const diffAmount = totalAmount - prevPeriodTotal;

    return res.status(200).json({
      success: true,
      data: {
        labels,
        currentData,
        previousData,
        totalAmount,
        prevPeriodAmount: prevPeriodTotal,
        diffAmount,
        hasPrevData
      }
    });
  } catch (error) {
    console.error("Lỗi getFluctuationData:", error);
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