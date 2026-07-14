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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function CashflowLineChart() {
  const [chartData, setChartData] = useState(null);

  const fetch14DaysData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/cashflow-14days');
      const json = await res.json();
      if (json.success) {
        setChartData({
          labels: json.data.labels,
          datasets: [
            {
              label: '📥 Tiền Thu',
              data: json.data.incomeData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#10b981',
              pointRadius: 4
            },
            {
              label: '📤 Tiền Chi',
              data: json.data.expenseData,
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

  useEffect(() => {
    fetch14DaysData();
  }, []);

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