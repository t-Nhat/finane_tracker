import React, { useState } from 'react';
import { useRefresh } from '../context/RefreshContext';

function TransactionForm({ onTransactionAdded }) {
  const { triggerRefresh } = useRefresh();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Chi');
  const [category, setCategory] = useState('Ăn uống');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 🟢 State loading

  // 🟢 Hàm lấy Token an toàn
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

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    const numAmount = Number(amount);

    if (numAmount < 1000) {
      alert("⚠️ Số tiền tối thiểu phải là 1.000 VNĐ!");
      return; 
    }
    if (numAmount > 1000000000) {
      alert("⚠️ Số tiền tối đa không được vượt quá 1 Tỷ VNĐ!");
      return; 
    }

    const selectedYear = new Date(date).getFullYear();
    if (selectedYear < 2000) {
      alert("⚠️ Vui lòng chọn ngày giao dịch từ năm 2000 trở đi!");
      return; 
    }

    const newTransaction = {
      amount: numAmount,
      type,
      category,
      date,
      note
    };

    setIsSubmitting(true); // 🟢 Bắt đầu loading

    try {
      const token = getToken(); // 🟢 Lấy token

      // 🟢 Gửi API có kèm Header Authorization
      const response = await fetch('http://localhost:5001/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🟢 Đính kèm Token
        },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        setAmount('');
        setNote('');
        setDate('');
        triggerRefresh(); // 🟢 Đồng bộ các tab khác
        if (onTransactionAdded) {
            onTransactionAdded();
        }
      } else {
        const errData = await response.json();
        alert(errData.message || "Có lỗi xảy ra khi lưu giao dịch!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsSubmitting(false); // 🟢 Tắt loading
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Loại giao dịch:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Thu">Thu</option>
          <option value="Chi">Chi</option>
        </select>
      </div>

      <div className="form-group">
        <label>Danh mục:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Lương">Lương</option>
          <option value="Ăn uống">Ăn uống</option>
          <option value="Đi lại">Đi lại</option>
          <option value="Hóa đơn">Hóa đơn</option>
        </select>
      </div>

      <div className="form-group">
        <label>Số tiền:</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          required 
          min="1000" 
          max="1000000000"
          placeholder="Ví dụ: 50000"
        />
      </div>

      <div className="form-group">
        <label>Ngày:</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
          min="2000-01-01" 
        />
      </div>

      <div className="form-group">
        <label>Ghi chú (Tùy chọn):</label>
        <input 
          type="text" 
          value={note} 
          onChange={(e) => setNote(e.target.value)} 
          placeholder="Ví dụ: Ăn trưa..."
        />
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? '⏳ Đang lưu...' : 'Lưu Giao Dịch'}
      </button>
    </form>
  );
}

export default TransactionForm;