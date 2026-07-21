// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Chuỗi kết nối MongoDB Atlas
const MONGO_URI = 'mongodb+srv://doan:doan123456@cluster0.hxzomla.mongodb.net/finance_tracker_db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB Atlas thành công!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB Atlas:', err.message));

// 2. Import đúng các file Route đang tồn tại
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Nếu có file budgetRoutes & notificationRoutes thì mở comment 2 dòng này:
// app.use('/api/budget', require('./routes/budgetRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
});