import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRefresh } from '../context/RefreshContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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

export default function CashflowLineChart() {
  const { refreshKey } = useRefresh();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetch14DaysData = async () => {
      try {
        const token = getToken();
        const res = await fetch('http://localhost:5001/api/dashboard/cashflow-14days', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          // Backend trả về mảng [{date, thu, chi}]
          const labels = json.data.map(item => item.date);
          const incomeData = json.data.map(item => item.thu);
          const expenseData = json.data.map(item => item.chi);

          setChartData({
            labels: labels,
            datasets: [
              {
                label: '📥 Tiền Thu',
                data: incomeData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#10b981',
                pointRadius: 4
              },
              {
                label: '📤 Tiền Chi',
                data: expenseData,
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#f43f5e',
                pointRadius: 4
              }
            ]
          });
        }
      } catch (err) {
        console.error('Lỗi tải biểu đồ dòng tiền:', err);
      }
    };

    fetch14DaysData();
  }, [refreshKey]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'sans-serif', size: 12, weight: 'bold' }, usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString('vi-VN')} đ`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value >= 1000000 ? `${value / 1000000}tr` : value >= 1000 ? `${value / 1000}k` : value,
          font: { size: 11 }
        },
        grid: { color: '#f1f5f9' }
      },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  };

  if (!chartData) return <div className="h-64 flex items-center justify-center text-gray-400 text-sm animate-pulse">Đang vẽ biểu đồ dòng tiền...</div>;

  return (
    <div className="h-72 w-full pt-2">
      <Line data={chartData} options={options} />
    </div>
  );
}