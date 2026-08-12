import React, { useState, useRef, useEffect } from 'react';

const BudgetSetting = () => {
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const limitInputRef = useRef(null);

  useEffect(() => {
    const el = limitInputRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const current = Number(limitAmount || 0);
      const next = Math.max(0, e.deltaY < 0 ? current + 1000 : current - 1000);
      setLimitAmount(next);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [limitAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token'); // Giả sử token lưu ở đây
      const response = await fetch('http://localhost:5001/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Thêm Token vào Header
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
    } finally {
      setIsSubmitting(false);
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
            ref={limitInputRef}
            id="limitInput"
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            placeholder="Nhập số tiền..."
            required
            min="0"
            step="1000"
            className="money-input"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Đang xử lý...' : 'Đặt hạn mức'}
        </button>
      </form>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default BudgetSetting;