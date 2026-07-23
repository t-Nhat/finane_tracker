const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Cấu hình CORS mở rộng - Cho phép Frontend kết nối
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:3000'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware đọc dữ liệu JSON gửi từ Client
app.use(express.json());

// 🟢 3. Hàm kiểm tra và nhúng Route an toàn (Đã sửa lỗi "handler must be a function")
const safeImportRoute = (routePath) => {
  try {
    const importedModule = require(routePath);
    // Tự động bóc tách nếu route xuất bản dưới dạng default export hoặc module.exports
    const router = importedModule.default || importedModule;

    // Kiểm tra xem dữ liệu import ra có đúng là 1 Router/Function hợp lệ không
    if (typeof router === 'function' || typeof router?.use === 'function') {
      return router;
    } else {
      throw new Error(`File ${routePath} không export ra một Express Router hợp lệ!`);
    }
  } catch (err) {
    console.warn(`⚠️ Cảnh báo: Không thể tải route [${routePath}]: ${err.message}`);
    const dummyRouter = express.Router();
    dummyRouter.use((req, res) => {
      res.status(501).json({ success: false, message: 'Route này chưa được cài đặt hoặc gặp lỗi' });
    });
    return dummyRouter;
  }
};

// 4. Gắn ĐẦY ĐỦ các đường dẫn API vào Server
app.use('/api/auth', safeImportRoute('./routes/authRoutes'));
app.use('/api/users', safeImportRoute('./routes/userRoutes'));
app.use('/api/transactions', safeImportRoute('./routes/transactionRoutes'));
app.use('/api/dashboard', safeImportRoute('./routes/dashboardRoutes'));
app.use('/api/notifications', safeImportRoute('./routes/notificationRoutes'));
const budgetRoutes = safeImportRoute('./routes/budgetRoutes');
app.use('/api/budget', budgetRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings-goals', safeImportRoute('./routes/savingsGoalRoutes'));
app.use('/api/loans', safeImportRoute('./routes/loanRoutes'));

// 5. Kết nối MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://doan:doan123456@cluster0.hxzomla.mongodb.net/finance_tracker_db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB Atlas thành công!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err.message));

// 6. Route kiểm tra trạng thái Server (Health Check Route)
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server Backend đang hoạt động bình thường!' });
});

// 7. Xử lý các đường dẫn API không tồn tại (404 Not Found)
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Đường dẫn API [${req.method} ${req.originalUrl}] không tồn tại trên hệ thống!` 
  });
});

// 8. Global Error Handler (Bắt các lỗi phát sinh từ Server)
app.use((err, req, res, next) => {
  console.error('🔥 Lỗi Server:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã có lỗi xảy ra ở phía Server!',
    error: err.message
  });
});

// 9. Khởi chạy Server ở Port 5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
});