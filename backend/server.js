const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối cơ sở dữ liệu MongoDB (Cổng mặc định 27017)
mongoose.connect('mongodb://localhost:27017/finance_tracker')
  .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Nhúng toàn bộ các Route đang có trong máy của ông
//app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));

// Khởi động server tại cổng 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
});