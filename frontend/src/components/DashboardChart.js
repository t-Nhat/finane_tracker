import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useRefresh } from '../context/RefreshContext';

ChartJS.register(ArcElement, Tooltip, Legend);

// Lấy Token an toàn
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

const DashboardChart = () => {
  const { refreshKey } = useRefresh();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false); // Thêm state kiểm tra rỗng

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = getToken();
        // 1. Sửa lại đúng endpoint đã được cấu hình trong `dashboardRoutes.js`
        const response = await fetch('http://localhost:5001/api/dashboard/chart-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        // 2. Xử lý đúng định dạng dữ liệu mới: { data: { labels: [], values: [] } }
        if (result.success && result.data && result.data.labels && result.data.values) {
          const { labels, values } = result.data;

          if (labels.length === 0) {
            setIsEmpty(true);
          } else {
            setIsEmpty(false);
            setChartData({
              labels: labels,
              datasets: [
                {
                  data: values,
                  backgroundColor: [
                    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'
                  ],
                  borderWidth: 1,
                }
              ]
            });
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu biểu đồ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [refreshKey]);

  // HIỂN THỊ LÚC ĐANG TẢI
  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Đang tải dữ liệu...</div>;
  }

  // HIỂN THỊ KHI TÀI KHOẢN MỚI (CHƯA CÓ GIAO DỊCH)
  if (isEmpty || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
        <p className="font-medium text-gray-600 dark:text-gray-300">Chưa có dữ liệu giao dịch</p>
        <p className="text-sm mt-1 text-gray-400">Hãy thêm khoản thu/chi đầu tiên để xem biểu đồ</p>
      </div>
    );
  }

  // HIỂN THỊ BIỂU ĐỒ BÌNH THƯỜNG
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full max-w-[300px]">
        <Pie 
          data={chartData} 
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }} 
        />
      </div>
    </div>
  );
};

export default DashboardChart;