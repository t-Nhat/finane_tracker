import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/dashboard/chart-data');
        const result = await response.json();
        if (result.success && result.data) {
          setChartData({
            labels: result.data.labels,
            datasets: [
              {
                label: 'Chi tiêu theo hạng mục (VNĐ)',
                data: result.data.values,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF',
                  '#FF9F40'
            ],
            borderWidth: 1,
          },
        ],
      });
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu biểu đồ:", error);
  } finally {
    setLoading(false);
  }
};

    fetchChartData();
  }, []);

  if (loading) return <div>Đang tải dữ liệu biểu đồ...</div>;

  return (
    <div className="chart-container">
      <h3>Tỷ trọng chi tiêu theo hạng mục</h3>
      {chartData.labels.length > 0 ? (
        <Pie data={chartData} />
      ) : (
        <p>Chưa có dữ liệu chi tiêu để hiển thị.</p>
      )}
    </div>
  );
};

export default DashboardChart;