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
        const response = await fetch('http://localhost:5001/api/dashboard/category-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        if (result.success && result.data) {
          const dataArray = result.data; // Dữ liệu backend trả về dạng [{category: '...', amount: 100}]

          // 1. KIỂM TRA RỖNG: Nếu mảng không có phần tử nào -> Bật cờ isEmpty lên
          if (dataArray.length === 0) {
            setIsEmpty(true);
            setLoading(false);
            return;
          }

          // 2. NẾU CÓ DỮ LIỆU: Map ra mảng labels và amounts cho Chart.js
          setIsEmpty(false);
          const mappedLabels = dataArray.map(item => item.category);
          const mappedAmounts = dataArray.map(item => item.amount);

          setChartData({
            labels: mappedLabels,
            datasets: [
              {
                data: mappedAmounts,
                backgroundColor: [
                  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
                ],
                borderWidth: 1,
              }
            ]
          });
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