const express = require('express');
const router = express.Router();
const { getMonthlyStats, getCategoryDataForChart } = require('../controllers/dashboardController');

router.get('/stats', getMonthlyStats);
router.get('/chart-data', getCategoryDataForChart);
router.get('/cashflow-14days', getCashflow14Days);
router.get('/net-worth', getNetWorth);

module.exports = router;