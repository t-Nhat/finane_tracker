
import React, { useState, useEffect } from 'react';
import './App.css';
import { useLanguage } from './context/LanguageContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  UserCheck, 
  Database, 
  Wallet, 
  LogOut,
  Sparkles,
  Calendar,
  PiggyBank as PiggyIcon,
  CreditCard
} from 'lucide-react';

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
import AuthPage from './components/AuthPage';

// 🟢 NHỦNG THÊM CÁC TÍNH NĂNG TÀI CHÍNH CAO CẤP MỚI
import PiggyBank from './components/PiggyBank';
import CreditDebtManager from './components/CreditDebtManager';
import NetWorthSummary from './components/NetWorthSummary';
import DataTransfer from './components/DataTransfer';
import ConfirmModal from './components/ConfirmModal';

function App() {
  const { t } = useLanguage();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mern_finance_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardYear, setDashboardYear] = useState(2026);
  const [dashboardMonth, setDashboardMonth] = useState('all');

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('user_theme') || 'light';
  });

  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;

    root.classList.remove('dark');

    if (themeMode === 'dark' || (themeMode === 'system' && isDarkSystem)) {
      root.classList.add('dark');
    }

    localStorage.setItem('user_theme', themeMode);
  }, [themeMode]);

  const handleLoginSuccess = (response) => {
    const token = response.token || response.accessToken || (response.data && response.data.token);
    const userData = response.user || response.data?.user || response;

    setUser(userData);
    localStorage.setItem('mern_finance_user', JSON.stringify(userData));

    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn("⚠️ Cảnh báo: Không tìm thấy Token riêng trong phản hồi từ Backend!");
    }

    window.location.reload();
  };

  const executeLogout = () => {
    setUser(null);
    localStorage.removeItem('mern_finance_user');
    localStorage.removeItem('token');
    localStorage.clear();
    window.location.reload();
  };

  const handleLogout = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác Nhận Đăng Xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
      onConfirm: executeLogout
    });
  };

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* SIDEBAR NAVIGATION BAR */}
      <aside className="w-full md:w-72 bg-slate-900 dark:bg-slate-950 text-white flex flex-col justify-between p-5 shadow-2xl shrink-0 border-r border-slate-800/80 h-screen z-20 overflow-y-auto">
        <div>
          {/* LOGO BRAND */}
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Wallet className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  QUẢN LÝ CHI TIÊU
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </h1>
              </div>
            </div>
          </div>

          {/* MENU ITEM LIST */}
          <nav className="flex flex-col space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('sidebar.dashboard')}</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'finance'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5" />
              <span>{t('sidebar.transactions')}</span>
            </button>

            {/* TAB MỚI: NUÔI HEO TIẾT KIỆM */}
            <button
              onClick={() => setActiveTab('piggy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'piggy'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <PiggyIcon className="w-5 h-5 text-pink-400" />
              <span>Nuôi Heo Tiết Kiệm</span>
            </button>

            {/* TAB MỚI: THẺ TÍN DỤNG & NỢ VAY */}
            <button
              onClick={() => setActiveTab('credit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'credit'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span>Thẻ Tín Dụng & Nợ Vay</span>
            </button>

            <button
              onClick={() => setActiveTab('fluctuation')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'fluctuation'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>{t('sidebar.cashflow')}</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>{t('sidebar.account')}</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Dữ Liệu & Cài Đặt</span>
            </button>
          </nav>
        </div>

        {/* THÔNG TIN USER Ở ĐÁY SIDEBAR */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full h-screen">

        {/* TOP HEADER BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 px-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="capitalize">{currentDateStr}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'dashboard' && t('sidebar.dashboard')}
              {activeTab === 'finance' && t('sidebar.transactions')}
              {activeTab === 'piggy' && 'Mục Tiêu & Nuôi Heo Tiết Kiệm'}
              {activeTab === 'credit' && 'Quản Lý Thẻ Tín Dụng & Nợ Vay'}
              {activeTab === 'fluctuation' && t('sidebar.cashflow')}
              {activeTab === 'account' && 'Thông Tin Cá Nhân & Tài Khoản'}
              {activeTab === 'system' && 'Cài Đặt & Quản Lý Dữ Liệu'}
            </h2>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <NotificationBell />
          </div>
        </header>

        {/* CÁC NỘI DUNG TABS */}
        <div className="mb-6"><BudgetAlert /></div>

        {/* Tab 1: Dashboard Chart & Line Chart + Net Worth Summary Card */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <NetWorthSummary />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80">
                <DashboardChart 
                  selectedYear={dashboardYear} 
                  setSelectedYear={setDashboardYear} 
                  selectedMonth={dashboardMonth} 
                  setSelectedMonth={setDashboardMonth} 
                />
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 h-fit">
                <CashflowLineChart 
                  selectedYear={dashboardYear} 
                  selectedMonth={dashboardMonth} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Thu Chi Trang */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80">
              <BudgetSetting />
            </div>
            <FinancePage />
          </div>
        )}

        {/* Tab Mới 3: Nuôi Heo Tiết Kiệm */}
        {activeTab === 'piggy' && (
          <div className="space-y-6">
            <PiggyBank />
          </div>
        )}

        {/* Tab Mới 4: Thẻ Tín Dụng & Nợ Vay */}
        {activeTab === 'credit' && (
          <div className="space-y-6">
            <CreditDebtManager />
          </div>
        )}

        {/* Tab 5: Biến động thu chi */}
        {activeTab === 'fluctuation' && (
          <div className="space-y-6">
            <CashflowFluctuation />
          </div>
        )}

        {/* Tab 6: Trang Tài khoản */}
        {activeTab === 'account' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80">
            <Account user={user} onLogout={handleLogout} />
          </div>
        )}

        {/* Tab 7: Hệ thống & Cài đặt */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Tùy Chỉnh Giao Diện</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chọn chế độ màu hiển thị phù hợp với sở thích của bạn</p>
              </div>
              <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80">
              <DataTransfer />
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80">
              <BackupHistory />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;