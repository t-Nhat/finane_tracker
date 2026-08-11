const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protect = require('../middleware/authMiddleware');

// Import các hàm controller
const {
  getSummary,
  getMonthlyStats,
  getCategoryDataForChart,
  getCashflow14Days,
  getFluctuationData
} = require('../controllers/dashboardController');

// Helper lấy userId hợp lệ
const getValidUserId = (req) => {
  if (req.userId) return new mongoose.Types.ObjectId(req.userId);
  if (req.user && req.user._id) return new mongoose.Types.ObjectId(req.user._id);
  return null;
};

// Helper tạo query lấy giao dịch theo user
const buildQuery = (userObjId) => {
  return userObjId ? { user: userObjId } : {};
};

// Áp dụng middleware 'protect' cho tất cả các route trong file này.
router.use(protect);

// API cho biểu đồ dòng tiền 14 ngày (tháng hiện tại)
router.get('/cashflow-14days', getCashflow14Days);

// API cho biểu đồ tròn (Pie Chart) - gom nhóm theo danh mục
router.get('/chart-data', getCategoryDataForChart);

// 2. API cho Ngân sách & Biểu đồ (hỗ trợ fallback)
router.get('/budgets', async (req, res) => {
  try {
    const db = mongoose.connection;
    const budgets = await db.collection('budgets').find(buildQuery(getValidUserId(req))).toArray();
    return res.status(200).json({ success: true, budgets, data: budgets });
  } catch (error) {
    return res.status(500).json({ success: false, budgets: [] });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const db = mongoose.connection;
    const transactions = await db.collection('transactions').find(buildQuery(getValidUserId(req))).toArray();
    return res.status(200).json({ success: true, transactions, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, transactions: [] });
  }
});

// 3. API cho biểu đồ tròn (Pie Chart) - gom nhóm theo danh mục Thu hoặc Chi
router.get('/category-data', async (req, res) => {
  try {
    const userObjId = getValidUserId(req);
    const filterType = req.query.type || 'Chi'; // Mặc định 'Chi'
    const db = mongoose.connection;
    const transactions = await db.collection('transactions').find(buildQuery(userObjId)).toArray();
    
    const categoryMap = {};
    transactions.forEach(t => {
      const isMatch = filterType === 'Thu'
        ? (t.type === 'Thu' || t.type === 'thu' || t.type === 'income')
        : (t.type === 'Chi' || t.type === 'chi' || t.type === 'expense');

      if (isMatch) { 
        const cat = t.category || 'Khác';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount || 0);
      }
    });
    
    const data = Object.keys(categoryMap).map(key => ({
      category: key,
      amount: categoryMap[key]
    }));
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu danh mục' });
  }
});

// API cho Biến động dòng tiền (Fluctuation)
router.get('/fluctuation', getFluctuationData);

// Các route khác từ controller để cung cấp dữ liệu cho dashboard
router.get('/summary', getSummary);
router.get('/monthly-stats', getMonthlyStats);

// API tính toán Sức khỏe tài chính & Tài sản ròng (Net Worth)
router.get('/net-worth', async (req, res) => {
  try {
    const userObjId = getValidUserId(req);
    const db = mongoose.connection;
    const query = buildQuery(userObjId);

    // 1. Tính tổng Ví (Thu - Chi) từ danh sách transactions
    const transactions = await db.collection('transactions').find(query).toArray();
    let cashBalance = 0;
    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      if (type === 'thu' || type === 'income') cashBalance += Number(t.amount || 0);
      else if (type === 'chi' || type === 'expense') cashBalance -= Number(t.amount || 0);
    });

    // 2. Tính tổng tiền trong heo tiết kiệm (savingsgoals)
    let totalSavings = 0;
    try {
      const goals = await db.collection('savingsgoals').find(query).toArray();
      goals.forEach(g => totalSavings += Number(g.currentAmount || 0));
    } catch (e) {}

    // 3. Tính tiền mượn / cho vay (loans)
    let totalLend = 0;
    let totalBorrow = 0;
    try {
      const loans = await db.collection('loans').find(query).toArray();
      loans.forEach(l => {
        if (l.type === 'LEND') totalLend += Number(l.amount || 0);
        if (l.type === 'BORROW') totalBorrow += Number(l.amount || 0);
      });
    } catch (e) {}

    // 4. Tính dư nợ thẻ / tổ chức (creditdebts)
    let totalOrgDebt = 0;
    try {
      const debts = await db.collection('creditdebts').find(query).toArray();
      debts.forEach(d => totalOrgDebt += Number(d.currentDebt || 0));
    } catch (e) {}

    const netWorth = (cashBalance + totalLend + totalSavings) - (totalBorrow + totalOrgDebt);

    return res.status(200).json({
      success: true,
      data: {
        netWorth,
        breakdown: {
          cashBalance,
          totalLend,
          totalSavings,
          totalBorrow,
          totalOrgDebt
        }
      }
    });
  } catch (error) {
    console.error("Lỗi tính net-worth:", error);
    return res.status(500).json({ success: false, message: 'Lỗi tính toán tổng tài sản' });
  }
});

module.exports = router;