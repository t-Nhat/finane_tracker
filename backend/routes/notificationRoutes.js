const express = require('express');
const router = express.Router();

const handleNotifications = (req, res) => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Hệ thống tài chính',
      message: 'Chào mừng active@example.com! Dữ liệu đã tải thành công.',
      date: new Date()
    }
  ];

  // Trả về linh hoạt để khớp với mọi cách Frontend gọi length
  return res.status(200).json(Object.assign(mockNotifications, {
    success: true,
    unreadCount: 1,
    notifications: mockNotifications,
    data: mockNotifications
  }));
};

router.get('/check', handleNotifications);
router.get('/', handleNotifications);

module.exports = router;