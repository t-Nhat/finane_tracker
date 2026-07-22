import React, { useState, useEffect } from 'react';

// 🌟 ĐỊNH NGHĨA BIẾN CỔNG BACKEND Ở ĐÂY
const API_URL = 'http://localhost:5001';

export default function Profile({ onLogout, onLoginClick }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const menuItems = [
    { id: 1, title: "Trung tâm trợ giúp", icon: "❓" },
    { id: 2, title: "Cài đặt thông báo", icon: "🔔" },
    { id: 3, title: "Chia sẻ góp ý", icon: "💬" },
    { id: 4, title: "Cài đặt tài khoản", icon: "⚙️" },
    { id: 5, title: "Thông tin chung", icon: "ℹ️" },
    { id: 6, title: "Ngôn ngữ", icon: "🌐" },
  ];

  // Lấy dữ liệu user từ Backend
  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Không lấy được dữ liệu user");
        return res.json();
      })
      .then((data) => {
        const userData = Array.isArray(data) ? data[0] : data;
        if (userData && Object.keys(userData).length > 0) {
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch thông tin user:", err);
        setIsLoggedIn(false);
        setLoading(false);
      });
  }, []);

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('mern_finance_user'); // Xóa cache đăng nhập
    setUser(null);
    setIsLoggedIn(false);
    alert("Đã đăng xuất thành công!");
    
    // Gọi hàm từ App.js nếu có để quay về AuthPage
    if (onLogout) onLogout();
  };

  // Xử lý Đăng nhập
  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      alert("Chuyển đến trang Đăng nhập");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', color: '#6B7280' }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // Lấy chữ cái đầu làm Avatar
  const getAvatarInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div style={styles.container}>
      
      {/* KHU VỰC THÔNG TIN TÀI KHOẢN */}
      <div style={styles.header}>
        {isLoggedIn ? (
          <>
            <div style={styles.avatar}>
              {getAvatarInitials(user?.name || user?.username)}
            </div>
            <h2 style={styles.name}>{user?.name || user?.username || "Người dùng"}</h2>
            <p style={styles.infoText}>📱 {user?.phone || user?.email || "Chưa cập nhật SĐT"}</p>
            <p style={styles.infoText}>💳 STK: {user?.accountNumber || user?._id || "N/A"}</p>
          </>
        ) : (
          <>
            <div style={{ ...styles.avatar, backgroundColor: '#9CA3AF' }}>?</div>
            <h2 style={styles.name}>Chưa đăng nhập</h2>
            <p style={styles.infoText}>Vui lòng đăng nhập để xem thông tin chi tiết</p>
          </>
        )}
      </div>

      {/* KHU VỰC MENU 6 MỤC */}
      <div style={styles.menuList}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            style={styles.menuItem}
            onClick={() => alert(`Bạn đã chọn: ${item.title}`)}
          >
            <div style={styles.leftContent}>
              <span style={styles.icon}>{item.icon}</span>
              <span style={styles.itemTitle}>{item.title}</span>
            </div>
            <span style={styles.arrow}>&gt;</span>
          </div>
        ))}
      </div>

      {/* NÚT ĐĂNG NHẬP / ĐĂNG XUẤT */}
      <div style={{ marginTop: '20px' }}>
        {isLoggedIn ? (
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        ) : (
          <button style={styles.loginBtn} onClick={handleLogin}>
            🔑 Đăng nhập
          </button>
        )}
      </div>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: '420px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid #F3F4F6'
  },
  avatar: {
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 auto 12px auto'
  },
  name: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827'
  },
  infoText: {
    margin: '3px 0',
    fontSize: '13px',
    color: '#6B7280'
  },
  menuList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid #E5E7EB'
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  icon: {
    fontSize: '18px'
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  arrow: {
    color: '#9CA3AF',
    fontWeight: 'bold'
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  loginBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: '0.2s'
  }
};