// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

const {
  getMonthlyStats,
  getCategoryDataForChart,
  getCashflow14Days,
  getFluctuationData
} = require('../controllers/dashboardController');

// Define đúng 4 routes khớp với 4 hàm đã import
router.get('/monthly-stats', getMonthlyStats);
router.get('/chart-data', getCategoryDataForChart);
router.get('/cashflow-14days', getCashflow14Days);
router.get('/fluctuation', getFluctuationData);

module.exports = router;