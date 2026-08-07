import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useRefresh } from '../context/RefreshContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ChevronRight as ArrowRightIcon
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

// Hàm lấy Token an toàn từ LocalStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  const savedUser = localStorage.getItem('mern_finance_user');
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      return parsed.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Map Icon đại diện sinh động cho từng Danh Mục
const getCategoryIcon = (catName) => {
  const name = catName ? catName.toLowerCase() : '';
  if (name.includes('ăn') || name.includes('uống') || name.includes('food')) return '🍔';
  if (name.includes('hóa đơn') || name.includes('bill') || name.includes('điện') || name.includes('nước')) return '🧾';
  if (name.includes('làm đẹp') || name.includes('spa') || name.includes('beauty')) return '💄';
  if (name.includes('mua sắm') || name.includes('shop')) return '🛍️';
  if (name.includes('đi lại') || name.includes('xe') || name.includes('xăng')) return '🚗';
  if (name.includes('lương') || name.includes('salary')) return '💵';
  if (name.includes('thưởng') || name.includes('bonus')) return '🎁';
  return '📦';
};

const DashboardChart = () => {
  const { refreshKey } = useRefresh();
  const [activeTab, setActiveTab] = useState('Chi'); // 'Chi' hoặc 'Thu'
  const [timeFilter, setTimeFilter] = useState('Tháng này');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await fetch('http://localhost:5001/api/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        let list = [];
        if (Array.isArray(result)) {
          list = result;
        } else if (result && Array.isArray(result.data)) {
          list = result.data;
        }
        setTransactions(list);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử giao dịch:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshKey]);

  // Lọc dữ liệu theo mốc thời gian
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filteredByTime = transactions.filter(t => {
    if (!t.date) return true;
    const d = new Date(t.date);
    if (timeFilter === 'Tháng này') {
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
    if (timeFilter === 'Tháng trước') {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }
    return true;
  });

  // Tính Tổng Thu nhập & Tổng Chi tiêu
  let totalExpense = 0;
  let totalIncome = 0;

  filteredByTime.forEach(t => {
    const isThu = t.type === 'Thu' || t.type === 'thu' || t.type === 'income';
    const isChi = t.type === 'Chi' || t.type === 'chi' || t.type === 'expense';
    const amt = Number(t.amount || 0);

    if (isThu) totalIncome += amt;
    if (isChi) totalExpense += amt;
  });

  // Tính mức chênh lệch so với tháng trước cho Banner Cảnh Báo 🔥
  const prevMonthExpense = transactions
    .filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const isChi = t.type === 'Chi' || t.type === 'chi' || t.type === 'expense';
      return isChi && d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const diffExpense = totalExpense - prevMonthExpense;

  // Gom nhóm các danh mục theo loại (Thu/Chi)
  const activeTransactions = filteredByTime.filter(t => {
    if (activeTab === 'Thu') {
      return t.type === 'Thu' || t.type === 'thu' || t.type === 'income';
    } else {
      return t.type === 'Chi' || t.type === 'chi' || t.type === 'expense';
    }
  });

  const categoryMap = {};
  let currentTotal = 0;

  activeTransactions.forEach(t => {
    const cat = t.category || 'Khác';
    const amt = Number(t.amount || 0);
    categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    currentTotal += amt;
  });

  // Sắp xếp danh mục theo số tiền từ cao xuống thấp
  const sortedCategories = Object.keys(categoryMap)
    .map(cat => ({
      name: cat,
      amount: categoryMap[cat],
      percentage: currentTotal > 0 ? Math.round((categoryMap[cat] / currentTotal) * 100) : 0,
      icon: getCategoryIcon(cat)
    }))
    .sort((a, b) => b.amount - a.amount);

  // Bảng màu chuẩn thiết kế
  const paletteChi = ['#ff9800', '#10b981', '#ec4899', '#f59e0b', '#9ca3af', '#8b5cf6', '#3b82f6'];
  const paletteThu = ['#10b981', '#059669', '#34d399', '#14b8a6', '#065f46', '#22c55e', '#15803d'];

  const colors = activeTab === 'Thu' ? paletteThu : paletteChi;

  const chartData = {
    labels: sortedCategories.map(c => c.name),
    datasets: [
      {
        data: sortedCategories.map(c => c.amount),
        backgroundColor: sortedCategories.map((_, idx) => colors[idx % colors.length]),
        borderWidth: 4,
        borderColor: '#ffffff',
        hoverOffset: 6
      }
    ]
  };

  return (
    <div className="w-full flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
      
      {/* 1. THANH CHỌN MỐC THỜI GIAN */}
      <div className="flex items-center justify-between w-full mb-5 px-2">
        <button 
          onClick={() => setTimeFilter(timeFilter === 'Tháng này' ? 'Tháng trước' : 'Tháng này')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white text-base">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{timeFilter}</span>
        </div>

        <button 
          onClick={() => setTimeFilter(timeFilter === 'Tháng này' ? 'Tất cả' : 'Tháng này')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. HAI TAB VIỀN NỔI BẬT THU CHI */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mb-4">
        
        {/* TAB CHI TIÊU */}
        <div 
          onClick={() => setActiveTab('Chi')}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
            activeTab === 'Chi' 
              ? 'border-pink-400 bg-pink-50/30 dark:bg-pink-950/20 shadow-md shadow-pink-500/10' 
              : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-500 flex items-center justify-center text-[10px]">
              💸
            </span>
            <span>Chi tiêu</span>
          </div>
          <div className="mt-2 text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {totalExpense.toLocaleString('vi-VN')}đ
          </div>
        </div>

        {/* TAB THU NHẬP */}
        <div 
          onClick={() => setActiveTab('Thu')}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
            activeTab === 'Thu' 
              ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10' 
              : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 flex items-center justify-center text-[10px]">
              📈
            </span>
            <span>Thu nhập</span>
          </div>
          <div className="mt-2 text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {totalIncome.toLocaleString('vi-VN')}đ
          </div>
        </div>

      </div>

      {/* 3. BANNER THÔNG BÁO 🔥 */}
      <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-xs leading-relaxed">
        <span className="text-base leading-none">🔥</span>
        <div className="flex-1 text-amber-900 dark:text-amber-300 font-medium">
          Dữ liệu {activeTab === 'Thu' ? 'thu nhập' : 'chi tiêu'} được cập nhật chính xác theo lịch sử giao dịch.
        </div>
        <ArrowRightIcon className="w-4 h-4 text-amber-500 shrink-0 self-center" />
      </div>

      {/* 4. BIỂU ĐỒ TRÒN DOUGHNUT + DANH SÁCH HẠNG MỤC % */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-400 text-sm">
          ⏳ Đang tải biểu đồ...
        </div>
      ) : sortedCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-gray-400 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 w-full p-6 text-center">
          <span className="text-3xl mb-2">{activeTab === 'Thu' ? '💰' : '💸'}</span>
          <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
            Chưa có giao dịch {activeTab === 'Thu' ? 'Thu nhập' : 'Chi tiêu'} ({timeFilter})
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hãy nhập giao dịch ở tab Thu Chi để hiển thị biểu đồ phân bổ.
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 my-2">
          
          {/* VẼ BIỂU ĐỒ TRÒN VÀNH KHĂN */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0 flex items-center justify-center">
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: '68%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const val = context.raw || 0;
                        return ` ${context.label}: ${val.toLocaleString('vi-VN')}đ`;
                      }
                    }
                  }
                }
              }}
            />
            {/* HIỂN THỊ TỔNG TIỀN Ở GIỮA BÁNH */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {activeTab === 'Thu' ? 'Tổng Thu' : 'Tổng Chi'}
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">
                {currentTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* HẠNG MỤC PHẦN TRĂM % */}
          <div className="flex-1 w-full flex flex-col gap-2">
            {sortedCategories.map((item, idx) => {
              const itemColor = colors[idx % colors.length];
              return (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {item.amount.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  <span 
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ml-2"
                    style={{ 
                      backgroundColor: `${itemColor}18`, 
                      color: itemColor 
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardChart;