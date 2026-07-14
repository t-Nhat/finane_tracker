const express = require('express');
const router = express.Router();
const { getMonthlyStats, getCategoryDataForChart } = require('../controllers/dashboardController');

router.get('/stats', getMonthlyStats);
router.get('/chart-data', getCategoryDataForChart);

module.exports = router;