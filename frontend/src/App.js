// src/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';

// --- IMPORT CÁC COMPONENT CŨ ---
import BudgetSetting from './components/BudgetSetting';
import DashboardChart from './components/DashboardChart';
import BudgetAlert from './components/BudgetAlert';
import CashflowLineChart from './components/CashflowLineChart';
import BackupHistory from './components/BackupHistory';
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/NotificationBell';
import CashflowFluctuation from './components/CashflowFluctuation';

// --- COMPONENT AUTH MỚI ---
import AuthPage from './components/AuthPage';
import { LogOut, User as UserIcon } from 'lucide-react';

function App() {
  // 1. STATE QUẢN LÝ USER (Kiểm tra xem đã đăng nhập chưa)
  // Mặc định kiểm tra trong localStorage để F5 không bị văng ra lại trang Login
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mern_finance_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Xử lý khi đăng nhập thành công từ AuthPage
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('mern_finance_user', JSON.stringify(userData));
  };

  // Xử lý Đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      setUser(null);
      localStorage.removeItem('mern_finance_user');
    }
  };

  // 2. NẾU CHƯA ĐĂNG NHẬP -> CHẶN HOÀN TOÀN, HIỆN TRANG AUTH
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // --- NẾU ĐÃ ĐĂNG NHẬP -> HIỆN GIAO DIỆN FINANCE TRACKER BÌNH THƯỜNG ---
  return (
    <div className="app-container min-h-[100dvh] bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION BAR */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-900/80 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
            <h1 className="text-xl font-bold tracking-wider text-emerald-400">💰 Quản Lý Chi Tiêu</h1>
          </div>

          <nav className="flex flex-col space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>📊 Tổng Quan</button>
            <button onClick={() => setActiveTab('transactions')} className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'transactions' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>💸 Giao Dịch & Ngân Sách</button>
            <button onClick={() => setActiveTab('fluctuation')} className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'fluctuation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>📈 Biến Động Thu Chi</button>
            <button onClick={() => setActiveTab('system')} className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'system' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>⚙️ Dữ Liệu & Sao Lưu</button>
          </nav>
        </div>

        {/* THÔNG TIN USER ĐANG ĐĂNG NHẬP Ở ĐÁY SIDEBAR */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* TOP HEADER BAR (Bổ sung nút Đăng xuất góc phải) */}
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'transactions' && 'Quản Lý Thu Chi & Hạn Mức'}
              {activeTab === 'fluctuation' && 'Phân Tích Biến Động Dòng Tiền'}
              {activeTab === 'system' && 'Cài Đặt & Quản Lý Dữ Liệu'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Không gian làm việc của: <strong className="text-emerald-500">{user.email}</strong></p>
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

        {/* CÁC PHẦN RENDER TABS GIỮ NGUYÊN NHƯ CŨ... */}
        <div className="mb-6"><BudgetAlert /></div>
        
        {activeTab === 'dashboard' && ( /* Code Tab 1 cũ */ <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="flex flex-col gap-6"><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><DashboardChart /></div></div><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 h-fit"><CashflowLineChart /></div></div> )}
        {activeTab === 'transactions' && ( /* Code Tab 2 cũ */ <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="space-y-6 lg:col-span-1"><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><BudgetSetting /></div></div><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-2"><div className="p-8 text-center text-gray-400 italic">📑 TransactionList</div></div></div> )}
        {activeTab === 'fluctuation' && ( <div className="space-y-6"><CashflowFluctuation /></div> )}
        {activeTab === 'system' && ( <div className="space-y-6"><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center"><div><h3 className="font-bold">🎨 Tùy Chỉnh Giao Diện</h3></div><ThemeToggle /></div><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><BackupHistory /></div></div> )}
      </main>
    </div>
  );
}

export default App;