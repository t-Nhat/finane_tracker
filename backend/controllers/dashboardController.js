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

module.exports = { getMonthlyStats, getCategoryDataForChart };