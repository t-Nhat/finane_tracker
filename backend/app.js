const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes'); 
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json()); 

const mongoURI = 'mongodb+srv://doan:doan123456@cluster0.hxzomla.mongodb.net/finance_tracker_db?appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Đã kết nối thành công với cơ sở dữ liệu MongoDB!'))
  .catch((error) => console.error('❌ Lỗi kết nối MongoDB:', error.message));

app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});