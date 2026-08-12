const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: false }, // Cho phép null nếu là hạn mức tổng
  amount: { type: Number, required: true },   
  limitAmount: { type: Number },               // Thêm trường limitAmount
  month: { type: String, required: true },    
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false                            // Để tạm false nếu chưa làm Auth đồng bộ
  }
}, { timestamps: true });

// 🟢 Xuất model an toàn để tránh lỗi "OverwriteModelError" khi reload server
module.exports = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);