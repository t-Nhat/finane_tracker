const jwt = require('jsonwebtoken');
const JWT_SECRET = "CHIA_KHOA_BI_MAT_CUA_BAN"; // Nên để trong file .env

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token để lấy userId
      const decoded = jwt.verify(token, JWT_SECRET);

      // Gán userId vào đối tượng req để các route đằng sau sử dụng
      req.userId = decoded.id || decoded.userId || decoded._id;
      
      next(); // Cho phép đi tiếp vào Controller/Route
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập!' });
  }
};

module.exports = protect;