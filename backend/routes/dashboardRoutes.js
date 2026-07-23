const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

// Import các hàm controller
const {
  getSummary,
  getMonthlyStats,
  getCategoryDataForChart,
  getCashflow14Days,
  getFluctuationData
} = require('../controllers/dashboardController');

// Áp dụng middleware 'protect' cho tất cả các route trong file này.
// Điều này đảm bảo mọi request tới dashboard đều phải được xác thực và có req.userId.
router.use(protect);

// API cho biểu đồ dòng tiền 14 ngày
router.get('/cashflow-14days', getCashflow14Days);

// API cho biểu đồ tròn (Pie Chart) - gom nhóm theo danh mục
router.get('/chart-data', getCategoryDataForChart);

// API cho Biến động dòng tiền (Fluctuation)
router.get('/fluctuation', getFluctuationData);

// Các route khác từ controller để cung cấp dữ liệu cho dashboard
router.get('/summary', getSummary);
router.get('/monthly-stats', getMonthlyStats);

// Ghi chú: Các route cũ như /data, /budgets, /charts trong file này đã được gỡ bỏ
// và thay thế bằng các route chuyên biệt, an toàn hơn ở trên.

module.exports = router;