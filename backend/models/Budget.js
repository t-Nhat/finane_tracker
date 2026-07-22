const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true }, // Vd: "Ăn uống"
  amount: { type: Number, required: true },   // Vd: 3000000 (3 triệu)
  month: { type: String, required: true },    // 🟢 Đã thêm dấu phẩy ở đây
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// 🟢 Xuất model an toàn để tránh lỗi "OverwriteModelError" khi reload server
module.exports = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);