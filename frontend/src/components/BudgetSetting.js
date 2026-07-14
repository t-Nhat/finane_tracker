import React, { useState } from 'react';

const BudgetSetting = () => {
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limitAmount: Number(limitAmount), month }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage(result.message);
      } else {
        setMessage('Lỗi: ' + result.message);
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi kết nối máy chủ.');
    }
  };

  return (
    <div className="budget-setting-container">
      <h3>Thiết lập Ngân sách</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="monthInput">Tháng:</label>
          <input
            id="monthInput"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="limitInput">Hạn mức (VNĐ):</label>
          <input
            id="limitInput"
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            placeholder="Nhập số tiền..."
            required
            min="0"
          />
        </div>
        <button type="submit">Đặt hạn mức</button>
      </form>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default BudgetSetting;