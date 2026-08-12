const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { OAuth2Client } = require('google-auth-library');
const protect = require('../middleware/authMiddleware');
const router = express.Router();
const GOOGLE_CLIENT_ID = "610134536543-iepm19bs8du5kjjel17ujssfl3guv3j8.apps.googleusercontent.com";
const JWT_SECRET = "CHIA_KHOA_BI_MAT_CUA_BAN";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ----------------------------------------------------
// 1. ROUTE ĐĂNG NHẬP (LOGIN)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const userEmail = email || username;

    if (!userEmail || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    const fallbackEmail = userEmail.includes('@') ? userEmail : `${userEmail}@example.com`;

    const user = await User.findOne({ 
      $or: [
        { email: userEmail }, 
        { username: userEmail },
        { email: fallbackEmail }
      ] 
    });

    if (!user) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Tài khoản này đăng nhập bằng Google hoặc chưa thiết lập mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ 
      message: "Đăng nhập thành công!", 
      token, 
      user: {
        id: user._id,
        name: user.name || user.username || (user.email ? user.email.split('@')[0] : 'Người dùng'),
        username: user.username || (user.email ? user.email.split('@')[0] : 'user'),
        email: user.email || user.username || ''
      }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: error.message || "Lỗi máy chủ khi đăng nhập!" });
  }
});

// ----------------------------------------------------
// 2. ROUTE ĐĂNG KÝ (REGISTER)
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const userEmail = email || username;

    if (!userEmail || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    const fallbackEmail = userEmail.includes('@') ? userEmail : `${userEmail}@example.com`;

    const existingUser = await User.findOne({ 
      $or: [
        { email: userEmail }, 
        { username: userEmail },
        { email: fallbackEmail }
      ] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name || (userEmail.includes('@') ? userEmail.split('@')[0] : userEmail),
      email: userEmail.includes('@') ? userEmail : `${userEmail}@example.com`,
      username: userEmail,
      password: hashedPassword
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({ 
      message: "Đăng ký thành công!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username || (newUser.email ? newUser.email.split('@')[0] : 'user'),
        email: newUser.email || newUser.username || ''
      }
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: error.message || "Lỗi máy chủ khi đăng ký!" });
  }
});

// ----------------------------------------------------
// 3. ROUTE GOOGLE AUTH
// ----------------------------------------------------
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Thiếu Google Token!" });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      payload = await response.json();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Xác thực Google thất bại!" });
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || '';

    let user = await User.findOne({ 
      $or: [{ email: email }, { username: email }] 
    });
    
    if (!user) {
      user = new User({
        name: name,
        email: email,
        username: email,
        password: "GOOGLE_LOGIN_NO_PASSWORD",
        avatar: picture
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ 
      message: "Đăng nhập Google thành công!", 
      token: jwtToken, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email || user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Lỗi Google Auth:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xử lý Google Auth!" });
  }
});

// ----------------------------------------------------
// 4. ROUTE LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP
// ----------------------------------------------------
// 🟢 Đã thêm Middleware `protect` đứng giữa
router.get('/me', protect, async (req, res) => {
  try {
    // req.userId được middleware protect giải mã từ Token ra
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;