import React from 'react';
import './App.css';
import BudgetSetting from './components/BudgetSetting';
import DashboardChart from './components/DashboardChart';
import BudgetAlert from './components/BudgetAlert';

function App() {
  return (
    <div className="App" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>📊 Theo Dõi Chi Tiêu Cá Nhân</h1>
      </header>
      
      {/* Khu vực hiển thị cảnh báo hạn mức (chỉ hiện khi vượt ngân sách) */}
      <BudgetAlert />

      <main style={{ display: 'grid', gap: '30px', marginTop: '20px' }}>
        {/* Component đặt hạn mức ngân sách */}
        <BudgetSetting />
        
        <hr style={{ width: '100%', border: '1px solid #eee' }} />

        {/* Component biểu đồ thống kê */}
        <DashboardChart />
      </main>
    </div>
  );
}

export default App;