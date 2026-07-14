const Transaction = require('../models/transactionModel');

const getMonthlyStats = async (req, res) => {
  try {
    const { month } = req.query;
    let matchStage = {};
    
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    stats.forEach(item => {
      if (item._id === 'Thu') totalIncome = item.total;
      if (item._id === 'Chi') totalExpense = item.total;
    });

    return res.status(200).json({
      success: true,
      data: { totalIncome, totalExpense },
      message: "Lấy thống kê tháng thành công"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message
    });
  }
};

const getCategoryDataForChart = async (req, res) => {
  try {
    const { month } = req.query;
    let matchStage = { type: 'Chi' };

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const categoryData = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const labels = categoryData.map(item => item._id);
    const values = categoryData.map(item => item.totalAmount);

    return res.status(200).json({
      success: true,
      data: { labels, values },
      message: "Lấy dữ liệu biểu đồ thành công"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message
    });
  }
};

const getCashflow14Days = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Lọc giao dịch trong 14 ngày và nhóm theo Ngày + Loại (Thu/Chi)
    const stats = await Transaction.aggregate([
      { $match: { date: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const labels = [];
    const incomeData = [];
    const expenseData = [];

    // Tạo mảng chuẩn 14 ngày liên tục (kể cả ngày không có giao dịch thì gán = 0)
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      labels.push(displayDate);

      const inc = stats.find(item => item._id.date === dateStr && item._id.type === 'Thu');
      const exp = stats.find(item => item._id.date === dateStr && item._id.type === 'Chi');

      incomeData.push(inc ? inc.total : 0);
      expenseData.push(exp ? exp.total : 0);
    }

    return res.status(200).json({
      success: true,
      data: { labels, incomeData, expenseData },
      message: "Lấy dữ liệu dòng tiền 14 ngày thành công"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getNetWorth = async (req, res) => {
  try {
    // 1. Tính tổng tiền hiện có trong các tài khoản (Tổng Thu trừ Tổng Chi)
    const txStats = await Transaction.aggregate([
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);
    let totalIncome = 0;
    let totalExpense = 0;
    txStats.forEach(item => {
      if (item._id === 'Thu') totalIncome = item.total;
      if (item._id === 'Chi') totalExpense = item.total;
    });
    const cashBalance = totalIncome - totalExpense;

    // 2. Tính tiền vay mượn cá nhân (Chưa thanh toán)
    const loans = await Loan.find({ status: 'PENDING' });
    let totalLend = 0;   // Tiền mình cho người khác mượn
    let totalBorrow = 0; // Tiền mình đang đi mượn
    loans.forEach(item => {
      if (item.type === 'LEND') totalLend += item.amount;
      if (item.type === 'BORROW') totalBorrow += item.amount;
    });

    // 3. Tính tiền tích góp trong Heo tiết kiệm
    const savings = await SavingsGoal.find();
    const totalSavings = savings.reduce((sum, item) => sum + (item.currentAmount || 0), 0);

    // 4. Tính nợ tổ chức (Thẻ tín dụng, vay ngân hàng, trả góp)
    const debts = await CreditDebt.find();
    const totalOrgDebt = debts.reduce((sum, item) => sum + (item.currentDebt || 0), 0);

    // 5. Áp dụng công thức tính Tài Sản Thực
    const netWorth = (cashBalance + totalLend + totalSavings) - (totalBorrow + totalOrgDebt);

    return res.status(200).json({
      success: true,
      data: {
        netWorth,
        breakdown: { cashBalance, totalLend, totalSavings, totalBorrow, totalOrgDebt }
      },
      message: "Tính toán tổng tài sản thực thành công"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật dòng export cuối cùng của file
module.exports = { getMonthlyStats, getCategoryDataForChart, getCashflow14Days, getNetWorth };