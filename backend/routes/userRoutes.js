const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Hoặc '../models/user' tùy tên file của bạn
const protect = require('../middleware/authMiddleware');

// API Lấy dữ liệu User DỰA TRÊN TOKEN ĐĂNG NHẬP
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng!' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi truy vấn MongoDB:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;