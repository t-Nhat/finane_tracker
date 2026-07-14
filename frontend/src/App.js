// src/App.js
import React, { useState } from 'react';
import './App.css';

// --- IMPORT COMPONENT CŨ CỦA NGƯỜI 2 ---
import BudgetSetting from './components/BudgetSetting';
import DashboardChart from './components/DashboardChart';
import BudgetAlert from './components/BudgetAlert';

// --- IMPORT TRỌN BỘ COMPONENT TÍNH NĂNG MỚI ---
import NetWorthSummary from './components/NetWorthSummary';
import CashflowLineChart from './components/CashflowLineChart';
import LoanManager from './components/LoanManager';
import CreditDebtManager from './components/CreditDebtManager';
import PiggyBank from './components/PiggyBank';
import DataTransfer from './components/DataTransfer';
import BackupHistory from './components/BackupHistory';
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/NotificationBell';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. SIDEBAR NAVIGATION BAR */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-900/80 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
            <h1 className="text-xl font-bold tracking-wider text-emerald-400">💰 FINANCE PRO</h1>
            {/* ĐÃ XÓA NÚT DARK THEME Ở ĐÂY THEO YÊU CẦU */}
          </div>

          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              📊 Tổng Quan & Biểu Đồ
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'transactions' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              💸 Giao Dịch & Ngân Sách
            </button>
            <button 
              onClick={() => setActiveTab('loans')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'loans' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              🤝 Vay Mượn & Thẻ Tín Dụng
            </button>
            <button 
              onClick={() => setActiveTab('savings')}
              className={`p-3 rounded-xl text-left font-medium transition ${activeTab === 'savings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold' : 'hover:bg-slate-800 text-gray-300'}`}
            >
              🐷 Heo Tiết Kiệm
            </button>
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        
        {/* TOP HEADER BAR */}
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'transactions' && 'Quản Lý Thu Chi & Hạn Mức'}
              {activeTab === 'loans' && 'Các Khoản Vay & Nợ Tín Dụng'}
              {activeTab === 'savings' && 'Mục Tiêu Tiết Kiệm'}
              {activeTab === 'system' && 'Cài Đặt & Quản Lý Dữ Liệu'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Theo dõi dòng tiền và sức khỏe tài chính của bạn</p>
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
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-800 p-6 rounded-2xl text-white shadow-lg">
              <NetWorthSummary />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 border-b dark:border-slate-800 pb-2 text-gray-700 dark:text-gray-200">Tỷ Trọng Chi Tiêu (Tháng)</h3>
                <DashboardChart />
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 border-b dark:border-slate-800 pb-2 text-gray-700 dark:text-gray-200">Dòng Tiền 14 Ngày Qua</h3>
                <CashflowLineChart />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GIAO DỊCH & NGÂN SÁCH */}
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
              <h3 className="text-base font-bold mb-4 border-b dark:border-slate-800 pb-2 text-gray-700 dark:text-gray-200">📋 Lịch Sử Giao Dịch</h3>
              <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed dark:border-slate-700 text-sm text-gray-400 italic">
                📑 Khung sẵn sàng cho bảng danh sách TransactionList của Người 1.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VAY MƯỢN & THẺ TÍN DỤNG */}
        {activeTab === 'loans' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
              <h3 className="text-base font-bold mb-4 text-amber-600 dark:text-amber-400">🤝 Vay Mượn Cá Nhân</h3>
              <LoanManager />
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
              <h3 className="text-base font-bold mb-4 text-purple-600 dark:text-purple-400">💳 Thẻ Tín Dụng & Vay Ngân Hàng</h3>
              <CreditDebtManager />
            </div>
          </div>
        )}

        {/* TAB 4: HEO TIẾT KIỆM */}
        {activeTab === 'savings' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
            <h3 className="text-base font-bold mb-4 text-pink-500 dark:text-pink-400">🐷 Mục Tiêu Tiết Kiệm (Piggy Bank)</h3>
            <PiggyBank />
          </div>
        )}

        {/* TAB 5: HỆ THỐNG & DỮ LIỆU */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            
            {/* KHUNG CÀI ĐẶT GIAO DIỆN (THEME) */}
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

            {/* HAI KHUNG CŨ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <span>📁</span> Nhập / Xuất Dữ Liệu (.JSON)
                </h3>
                <DataTransfer />
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>🛡️</span> Lịch Sử Sao Lưu Tự Động
                </h3>
                <BackupHistory />
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;