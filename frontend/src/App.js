// src/App.js
import React, { useState } from 'react';
import './App.css';

// --- IMPORT CÁC COMPONENT TÍNH NĂNG ---
import BudgetSetting from './components/BudgetSetting';
import DashboardChart from './components/DashboardChart';
import BudgetAlert from './components/BudgetAlert';
import CashflowLineChart from './components/CashflowLineChart';
import BackupHistory from './components/BackupHistory';
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/NotificationBell';
import CashflowFluctuation from './components/CashflowFluctuation';
import FinancePage from './components/FinancePage';
import Account from './components/Account';

// --- COMPONENT AUTH ---
import AuthPage from './components/AuthPage';
import { LogOut } from 'lucide-react';

function App() {
  // 1. STATE QUẢN LÝ USER (Kiểm tra đăng nhập từ localStorage)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mern_finance_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // 🟢 XỬ LÝ ĐĂNG NHẬP THÀNH CÔNG (ĐÃ ĐƯỢC CẬP NHẬT CHUẨN)
  const handleLoginSuccess = (response) => {
    // Tự động tìm Token từ các cấu trúc response khác nhau
    const token = response.token || response.accessToken || (response.data && response.data.token);
    
    // Tự động tìm thông tin User
    const userData = response.user || response.data?.user || response;

    setUser(userData);
    localStorage.setItem('mern_finance_user', JSON.stringify(userData));
    
    // 🟢 LƯU TOKEN CHUẨN XÁC VÀO LOCALSTORAGE
    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn("⚠️ Cảnh báo: Không tìm thấy Token riêng trong phản hồi từ Backend!");
    }

    // 🟢 LOAD LẠI TRANG: Đảm bảo xóa sạch State/Cache cũ và tải lại dữ liệu chuẩn theo Token mới
    window.location.reload();
  };

  // 🟢 XỬ LÝ ĐĂNG XUẤT (ĐÃ ĐƯỢC CẬP NHẬT CHUẨN)
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      setUser(null);
      
      // Xóa triệt để toàn bộ dữ liệu tạm trên Trình duyệt
      localStorage.removeItem('mern_finance_user');
      localStorage.removeItem('token');
      localStorage.clear();
      
      // Làm mới lại toàn bộ ứng dụng
      window.location.reload();
    }
  };

  // 2. NẾU CHƯA ĐĂNG NHẬP -> HIỆN TRANG AUTH
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. NẾU ĐÃ ĐĂNG NHẬP -> HIỆN FULL APP GIAO DIỆN KẾT HỢP
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION BAR */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-900/90 text-white flex flex-col justify-between p-5 shadow-xl shrink-0 border-r border-slate-800 h-screen">
        <div>
          {/* LOGO BRAND */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h1 className="text-lg font-bold tracking-wider text-emerald-400 uppercase">
              Quản Lý Chi Tiêu
            </h1>
          </div>

          {/* MENU ITEM LIST */}
          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Tổng Quan
            </button>

            <button 
              onClick={() => setActiveTab('finance')} 
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left ${
                activeTab === 'finance' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Thu Chi & Giao Dịch
            </button>

            <button 
              onClick={() => setActiveTab('fluctuation')} 
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left ${
                activeTab === 'fluctuation' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Biến Động Dòng Tiền
            </button>

            <button 
              onClick={() => setActiveTab('account')} 
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left ${
                activeTab === 'account' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Tài Khoản Của Tôi
            </button>

            <button 
              onClick={() => setActiveTab('system')} 
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-left ${
                activeTab === 'system' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Dữ Liệu & Cài Đặt
            </button>
          </nav>
        </div>

        {/* THÔNG TIN USER Ở ĐÁY SIDEBAR */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full h-screen">
        
        {/* TOP HEADER BAR */}
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'finance' && 'Quản Lý Thu Chi Chi Tiết'}
              {activeTab === 'fluctuation' && 'Phân Tích Biến Động Dòng Tiền'}
              {activeTab === 'account' && 'Thông Tin Cá Nhân & Tài Khoản'}
              {activeTab === 'system' && 'Cài Đặt & Quản Lý Dữ Liệu'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Xin chào, <strong className="text-emerald-500">{user.name || user.email}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-800 mx-1" />
            
            {/* NÚT LOGOUT */}
            <button
              onClick={handleLogout}
              title="Đăng xuất khỏi tài khoản"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* CÁC NỘI DUNG TABS */}
        <div className="mb-6"><BudgetAlert /></div>
        
        {/* Tab 1: Dashboard Chart & Line Chart */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
              <DashboardChart />
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 h-fit">
              <CashflowLineChart />
            </div>
          </div>
        )}

        {/* Tab 2: Thu Chi Trang */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6">
              <BudgetSetting />
            </div>
            <FinancePage />
          </div>
        )}

        {/* Tab 3: Biến động thu chi */}
        {activeTab === 'fluctuation' && (
          <div className="space-y-6">
            <CashflowFluctuation />
          </div>
        )}

        {/* Tab 4: Trang Tài khoản */}
        {activeTab === 'account' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <Account user={user} />
          </div>
        )}

        {/* Tab 5: Hệ thống & Cài đặt */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold">Tùy Chỉnh Giao Diện</h3>
              </div>
              <ThemeToggle />
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
              <BackupHistory />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;