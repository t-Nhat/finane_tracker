import React, { useState } from 'react';
// 1. Nhập thư viện Google vào đây
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function AuthForm({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); 
        if (isLoginMode) {
          onLoginSuccess(data); 
        } else {
          setIsLoginMode(true);
          setPassword(''); 
        }
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến máy chủ!");
    }
  };

  // Hàm xử lý tạm thời cho nút Facebook
  const handleFacebookLogin = () => {
    alert("Tính năng đăng nhập Facebook đang được phát triển! Cần cấu hình App ID.");
  };

  return (
    // 2. Bọc toàn bộ form bằng GoogleOAuthProvider với mã Client ID của bạn
    <GoogleOAuthProvider clientId="610134536543-iepm19bs8du5kjjel17ujssfl3guv3j8.apps.googleusercontent.com">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ background: '#222', padding: '40px', borderRadius: '10px', textAlign: 'center', width: '350px' }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>
            {isLoginMode ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
            />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
            />
            
            <button type="submit" className="submit-btn" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              {isLoginMode ? 'Vào Trong 🚀' : 'Tạo Tài Khoản 📝'}
            </button>
          </form>

          {/* --- KHU VỰC NÚT ĐĂNG NHẬP MẠNG XÃ HỘI --- */}
          <div style={{ marginTop: '25px', borderTop: '1px solid #444', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ color: '#aaa', fontSize: '14px', marginBottom: '5px' }}>Hoặc kết nối với</span>
            
            {/* 3. NÚT GOOGLE CHÍNH CHỦ */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    // Gửi mã vé của Google xuống Backend để kiểm tra
                    const res = await fetch('http://localhost:5001/api/auth/google', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ token: credentialResponse.credential }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                      alert(data.message); // Báo Đăng nhập thành công!
                      onLoginSuccess(data); // Mở cửa cho vào web
                    } else {
                      alert(`❌ Lỗi: ${data.message}`);
                    }
                  } catch (error) {
                    console.error("Lỗi khi kết nối Backend:", error);
                    alert("Không thể kết nối đến máy chủ Backend!");
                  }
                }}
                onError={() => {
                  console.log('Đăng nhập Google thất bại');
                  alert("❌ Đăng nhập Google thất bại!");
                }}
              />
            </div>
            
            <button 
              type="button" 
              onClick={handleFacebookLogin}
              style={{ background: '#4267B2', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              Facebook
            </button>
          </div>
          {/* -------------------------------------- */}

          <p style={{ color: '#aaa', marginTop: '20px', fontSize: '14px' }}>
            {isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
            <span 
              onClick={() => setIsLoginMode(!isLoginMode)} 
              style={{ color: '#4da6ff', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
            >
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AuthForm;