// src/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';

// --- COMPONENT CŨ ---
import BudgetSetting from './components/BudgetSetting';
import DashboardChart from './components/DashboardChart';
import BudgetAlert from './components/BudgetAlert';

// --- COMPONENT TÍNH NĂNG MỚI ---
import CashflowLineChart from './components/CashflowLineChart';
import BackupHistory from './components/BackupHistory';
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/NotificationBell';
import CashflowFluctuation from './components/CashflowFluctuation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // STATE LƯU TRỮ TỔNG THU / CHI THẬT TỪ MONGODB
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // KẾT NỐI API LẤY DỮ LIỆU THÁNG HIỆN TẠI
  useEffect(() => {
    setLoadingStats(true);
    axios.get('http://localhost:5000/api/dashboard/monthly-stats')
      .then((res) => {
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error("Chưa có kết nối Backend cho số dư tháng:", err);
        setStats({ totalIncome: 0, totalExpense: 0 });
        setLoadingStats(false);
      });
  }, [activeTab]);

  return (
    <div className="app-container min-h-[100dvh] bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. SIDEBAR NAVIGATION BAR */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-900/80 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
            <h1 className="text-xl font-bold tracking-wider text-emerald-400">💰 Quản Lý Chi Tiêu</h1>
          </div>

          <nav className="flex flex-col space-y-2">
            {/* TAB 1: TỔNG QUAN */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              📊 Tổng Quan
            </button>
            
            {/* TAB 2: GIAO DỊCH & NGÂN SÁCH */}
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'transactions' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              💸 Giao Dịch & Ngân Sách
            </button>

            {/* TAB 3: BIẾN ĐỘNG THU CHI (TAB MỚI TÁCH) */}
            <button 
              onClick={() => setActiveTab('fluctuation')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'fluctuation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              📈 Biến Động Thu Chi
            </button>

            {/* TAB 4: DỮ LIỆU & SAO LƯU */}
            <button 
              onClick={() => setActiveTab('system')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'system' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              ⚙️ Dữ Liệu & Sao Lưu
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-gray-400">
          <p className="font-semibold text-gray-300">MERN Stack v2.0</p>
          <p className="mt-1">© 2026 Finance Tracker</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* TOP HEADER BAR */}
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'transactions' && 'Quản Lý Thu Chi & Hạn Mức'}
              {activeTab === 'fluctuation' && 'Phân Tích Biến Động Dòng Tiền'}
              {activeTab === 'system' && 'Cài Đặt & Quản Lý Dữ Liệu'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {activeTab === 'fluctuation' 
                ? 'So sánh chi tiết thu nhập, chi tiêu và chênh lệch tài chính theo chu kỳ' 
                : 'Theo dõi dòng tiền và sức khỏe tài chính của bạn'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* KHU VỰC CẢNH BÁO NGÂN SÁCH */}
        <div className="mb-6">
          <BudgetAlert />
        </div>

        {/* --- NỘI DUNG THEO TỪNG TAB --- */}

        {/* TAB 1: TỔNG QUAN */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cột trái: Biểu đồ tròn + 2 ô Thu Nhập / Chi Tiêu */}
            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 border-b dark:border-slate-800 pb-2 text-gray-700 dark:text-gray-200">
                  Chi tiêu tháng
                </h3>
                <DashboardChart />
              </div>

              {/* KẾT NỐI DATA THẬT: 2 Ô CHI TIÊU & THU NHẬP */}
              <div className="grid grid-cols-2 gap-4">
                {/* Ô Thu Nhập */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:to-emerald-900/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Thu Nhập</span>
                    <span className="text-lg">📥</span>
                  </div>
                  {loadingStats ? (
                    <div className="h-7 w-28 bg-emerald-200/50 dark:bg-emerald-900/30 animate-pulse rounded-lg mt-1"></div>
                  ) : (
                    <p className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mt-1">
                      {stats.totalIncome ? stats.totalIncome.toLocaleString('vi-VN') : '0'}đ
                    </p>
                  )}
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                    {stats.totalIncome > 0 ? '✅ Đã đồng bộ từ Atlas' : '⚪ Chưa có khoản thu tháng này'}
                  </p>
                </div>

                {/* Ô Chi Tiêu */}
                <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 dark:from-rose-950/40 dark:to-rose-900/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Chi Tiêu</span>
                    <span className="text-lg">📤</span>
                  </div>
                  {loadingStats ? (
                    <div className="h-7 w-28 bg-rose-200/50 dark:bg-rose-900/30 animate-pulse rounded-lg mt-1"></div>
                  ) : (
                    <p className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mt-1">
                      {stats.totalExpense ? stats.totalExpense.toLocaleString('vi-VN') : '0'}đ
                    </p>
                  )}
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-2">
                    {stats.totalExpense > 0 ? '✅ Đã đồng bộ từ Atlas' : '⚪ Chưa có khoản chi tháng này'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cột phải: Biểu đồ đường dòng tiền 14 ngày */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors h-fit">
              <h3 className="text-base font-bold mb-4 border-b dark:border-slate-800 pb-2 text-gray-700 dark:text-gray-200">
                Dòng Tiền 14 Ngày Qua
              </h3>
              <CashflowLineChart />
            </div>

          </div>
        )}

        {/* TAB 2: GIAO DỊCH & NGÂN SÁCH (Đã làm sạch, xóa phần Biến Động ra khỏi đáy) */}
        {activeTab === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>🎯</span> Thiết Lập Ngân Sách
                </h3>
                <BudgetSetting />
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span>➕</span> Thêm Giao Dịch Mới
                </h3>
                <div className="p-4 bg-blue-50/50 dark:bg-slate-800/50 rounded-xl border border-blue-100 dark:border-slate-700 text-xs text-blue-700 dark:text-blue-300 leading-relaxed italic">
                  📝 Khung sẵn sàng cho form giao dịch của Người 1.
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-2 transition-colors">
              <h3 className="text-base font-bold mb-4 border-b dark:border-slate-800 pb-2 text-gray-700 dark:text-gray-200">
                📋 Lịch Sử Giao Dịch
              </h3>
              <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed dark:border-slate-700 text-sm text-gray-400 italic">
                📑 Khung sẵn sàng cho bảng danh sách TransactionList của Người 1.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BIẾN ĐỘNG THU CHI (TAB MỚI HOÀN TOÀN) */}
        {activeTab === 'fluctuation' && (
          <div className="space-y-6">
            <CashflowFluctuation />
          </div>
        )}

        {/* TAB 4: HỆ THỐNG & DỮ LIỆU */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>🎨</span> Tùy Chỉnh Giao Diện Hệ Thống
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Chọn chế độ hiển thị Sáng / Tối hoặc tự động đồng bộ theo thời gian thực của máy tính.
                </p>
              </div>
              <div className="self-end md:self-center shrink-0">
                <ThemeToggle />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
              <h3 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>🛡️</span> Lịch Sử Sao Lưu Tự Động (Max 30 Snapshot)
              </h3>
              <BackupHistory />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;