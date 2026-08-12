const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  username: {
    type: String,
    sparse: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String 
  },
  googleId: { 
    type: String 
  },
  avatar: { 
    type: String 
  },
  // Bổ sung các trường nếu trên giao diện Account.js có hiển thị
  phone: { 
    type: String, 
    default: "" 
  },
  accountNumber: { 
    type: String, 
    default: "" 
  }
}, { 
  timestamps: true // Tự động quản lý createdAt, updatedAt
});

// BẮT BUỘC EXPORT MODEL
const User = mongoose.model('User', userSchema);
module.exports = User;