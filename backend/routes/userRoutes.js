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

// API Cập nhật thông tin tài khoản
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Tìm và cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { 
        $set: { 
          name: name || undefined, 
          phone: phone || undefined 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng!' });
    }

    res.status(200).json({ success: true, message: 'Cập nhật thành công!', data: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;