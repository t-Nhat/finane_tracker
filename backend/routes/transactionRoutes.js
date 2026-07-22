const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction'); // Đường dẫn tới Model Transaction
const protect = require('../middleware/authMiddleware'); // Middleware kiểm tra Token/Đăng nhập

// ==========================================
// 1. LẤY DANH SÁCH GIAO DỊCH (GET /api/transactions)
// ==========================================
router.get('/', protect, async (req, res) => {
  try {
    // 🟢 CHỈ LẤY GIAO DỊCH CỦA USER ĐANG ĐĂNG NHẬP (req.userId lấy từ protect middleware)
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách giao dịch:', error);
    res.status(500).json({ success: false, message: 'Lỗi Server khi tải giao dịch' });
  }
});

// ==========================================
// 2. THÊM GIAO DỊCH MỚI (POST /api/transactions)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { type, category, amount, date, note } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    // 🟢 GÁN ID NGƯỜI DÙNG ĐANG ĐĂNG NHẬP VÀO GIAO DỊCH MỚI
    const newTransaction = await Transaction.create({
      user: req.userId, // 🔥 Dòng này giúp dữ liệu không bị lẫn lộn giữa các tài khoản!
      type,
      category,
      amount: Number(amount),
      date: date || Date.now(),
      note: note || ''
    });

    res.status(201).json({
      success: true,
      data: newTransaction
    });
  } catch (error) {
    console.error('Lỗi tạo giao dịch:', error);
    res.status(500).json({ success: false, message: 'Lỗi Server khi thêm giao dịch' });
  }
});

// ==========================================
// 3. XÓA GIAO DỊCH (DELETE /api/transactions/:id)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    // 🟢 CHỈ XÓA NẾU GIAO DỊCH ĐÓ THUỘC SỞ HỮU CỦA USER ĐANG ĐĂNG NHẬP
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch hoặc bạn không có quyền xóa' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa giao dịch thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa giao dịch:', error);
    res.status(500).json({ success: false, message: 'Lỗi Server khi xóa giao dịch' });
  }
});

module.exports = router;