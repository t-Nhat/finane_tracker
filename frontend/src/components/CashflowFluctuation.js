import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CashflowFluctuation() {
  const [timeframe, setTimeframe] = useState('thang');
  const [metric, setMetric] = useState('chitieu');
  const [comparePeriod, setComparePeriod] = useState(true);

  // State lưu trữ dữ liệu từ Backend
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState({
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Kỳ này'],
    currentData: [0, 0, 0, 0, 0, 0, 0],
    previousData: [0, 0, 0, 0, 0, 0, 0],
    totalAmount: 0,
    diffAmount: 0
  });

  // Gọi API lấy dữ liệu thật từ Backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Lấy ID tài khoản đang đăng nhập từ localStorage
    const rawUser = localStorage.getItem('mern_finance_user') || localStorage.getItem('user') || localStorage.getItem('userInfo');
    let userId = '60d5ecb8b392d700153ee002'; // Fallback mặc định cho active@example.com
    
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        userId = parsed.id || parsed._id || parsed.userId || userId;
      } catch (e) {
        console.warn('Lỗi đọc dữ liệu người dùng:', e);
      }
    }

    axios.get(`http://localhost:5000/api/dashboard/fluctuation`, {
      params: { timeframe, metric, userId },
      headers: { 'user-id': userId }
    })
      .then((res) => {
        if (!isMounted) return;

        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          setApiData({
            labels: Array.isArray(d.labels) ? d.labels : ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Kỳ này'],
            currentData: Array.isArray(d.currentData) ? d.currentData : [0, 0, 0, 0, 0, 0, 0],
            previousData: Array.isArray(d.previousData) ? d.previousData : [0, 0, 0, 0, 0, 0, 0],
            totalAmount: Number(d.totalAmount || 0),
            diffAmount: Number(d.diffAmount || 0)
          });
        } else {
          setApiData({
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Kỳ này'],
            currentData: [0, 0, 0, 0, 0, 0, 0],
            previousData: [0, 0, 0, 0, 0, 0, 0],
            totalAmount: 0,
            diffAmount: 0
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi kết nối dữ liệu biến động:", err);
        if (isMounted) {
          setApiData({
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Kỳ này'],
            currentData: [0, 0, 0, 0, 0, 0, 0],
            previousData: [0, 0, 0, 0, 0, 0, 0],
            totalAmount: 0,
            diffAmount: 0
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [timeframe, metric]);

  // AN TOÀN TUYỆT ĐỐI: Tạo mảng phòng thủ chống lỗi .every() trên undefined
  const safeCurrentData = Array.isArray(apiData?.currentData) ? apiData.currentData : [];
  const safePreviousData = Array.isArray(apiData?.previousData) ? apiData.previousData : [];
  const safeLabels = Array.isArray(apiData?.labels) && apiData.labels.length > 0 
    ? apiData.labels 
    : ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Kỳ này'];

  // Kiểm tra xem Database có đang trống hoàn toàn không
  const isDataEmpty = safeCurrentData.length === 0 || (
    safeCurrentData.every(val => Number(val || 0) === 0) && 
    safePreviousData.every(val => Number(val || 0) === 0)
  );

  // Cấu hình Chart.js
  const chartData = {
    labels: safeLabels,
    datasets: [
      {
        label: metric === 'chitieu' ? 'Chi tiêu hiện tại' : metric === 'thunhap' ? 'Thu nhập hiện tại' : 'Chênh lệch',
        data: safeCurrentData,
        backgroundColor: safeLabels.map((_, index) =>
          index === safeLabels.length - 1 ? '#007aff' : '#7cb9ff'
        ),
        borderRadius: 6,
        barPercentage: 0.7,
        order: 1,
      },
      ...(comparePeriod
        ? [
            {
              label: 'Cùng kỳ trước',
              data: safePreviousData,
              backgroundColor: '#d6e8ff',
              borderRadius: 6,
              barPercentage: 0.9,
              order: 2,
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 13, family: 'sans-serif' },
        bodyFont: { size: 12, family: 'sans-serif', weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${Number(context.raw || 0).toLocaleString('vi-VN')}đ`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: '600', size: 12 }, color: '#64748b' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          callback: (value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)} Tr` : Number(value).toLocaleString('vi-VN'),
          font: { size: 11 },
          color: '#94a3b8',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-gray-100 transition-colors">
      
      {/* 1. THANH CHỌN THỜI GIAN */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto">
          {['tuan', 'thang', 'nam'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab)}
              className={`flex-1 sm:px-8 py-2 rounded-xl text-sm font-bold transition-all ${
                timeframe === tab
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'tuan' && 'Theo tuần'}
              {tab === 'thang' && 'Theo tháng'}
              {tab === 'nam' && 'Theo năm'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. THANH CHỌN CHỈ SỐ */}
      <div className="flex justify-center mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="inline-flex gap-2">
          {[
            { id: 'thunhap', label: 'Thu nhập' },
            { id: 'chitieu', label: 'Chi tiêu' },
            { id: 'chenhlech', label: 'Chênh lệch' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMetric(item.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                metric === item.id
                  ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. HIỂN THỊ SỐ TỔNG & BADGE TĂNG GIẢM */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {metric === 'chitieu' && 'Tổng chi kỳ này'}
          {metric === 'thunhap' && 'Tổng thu kỳ này'}
          {metric === 'chenhlech' && 'Chênh lệch kỳ này'}
        </p>
        
        {loading ? (
          <div className="h-9 w-48 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-xl mx-auto mt-1"></div>
        ) : (
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
            {apiData?.totalAmount ? Number(apiData.totalAmount).toLocaleString('vi-VN') : '0'}đ
          </h3>
        )}

        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold">
          <span>{(apiData?.diffAmount || 0) >= 0 ? '↑' : '↓'}</span>
          <span>
            {(apiData?.diffAmount || 0) >= 0 ? 'Tăng ' : 'Giảm '} 
            {Math.abs(apiData?.diffAmount || 0).toLocaleString('vi-VN')}đ so với cùng kỳ trước
          </span>
        </div>
      </div>

      {/* 4. TIÊU ĐỀ BIỂU ĐỒ & NÚT GẠT SO VỚI CÙNG KỲ */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-base font-bold text-gray-800 dark:text-gray-200">Biến động</span>
        <label className="inline-flex items-center cursor-pointer gap-2.5">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">So với cùng kỳ</span>
          <div
            onClick={() => setComparePeriod(!comparePeriod)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              comparePeriod ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                comparePeriod ? 'translate-x-5' : ''
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* 5. KHUNG BIỂU ĐỒ CỘT (HOẶC MÀN HÌNH TRỐNG KHI CHƯA CÓ DATA) */}
      <div className="h-64 w-full relative flex items-center justify-center">
        {loading ? (
          <div className="w-full h-full bg-gray-50 dark:bg-slate-800/40 animate-pulse rounded-2xl flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">Đang tải biểu đồ từ Atlas...</span>
          </div>
        ) : isDataEmpty ? (
          <div className="w-full h-full border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-gray-50/50 dark:bg-slate-800/20">
            <span className="text-3xl mb-2">📊</span>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Chưa có giao dịch nào trong kỳ này</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Hãy thêm các khoản thu chi mới ở tab Giao Dịch để hệ thống tự động vẽ biểu đồ phân tích!
            </p>
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      {/* 6. CHÚ THÍCH MÀU */}
      {!isDataEmpty && !loading && (
        <div className="flex justify-center items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs font-medium text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#007aff] inline-block"></span>
            <span>{metric === 'chitieu' ? 'Chi tiêu kỳ này' : 'Thực tế kỳ này'}</span>
          </div>
          {comparePeriod && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#d6e8ff] inline-block"></span>
              <span>Cùng kỳ trước</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
