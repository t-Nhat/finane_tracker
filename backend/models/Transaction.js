const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // 🟢 BẮT BỘC CÓ TRƯỜNG NÀY ĐỂ ĐỊNH DẠNG CHỦ SỞ HỮU GIAO DỊCH
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['Thu', 'Chi', 'Tiết kiệm', 'Rút tiết kiệm'],
      required: true
    },
    category: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);