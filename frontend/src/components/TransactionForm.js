import React, { useState } from 'react';
import { useRefresh } from '../context/RefreshContext';
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function TransactionForm({ onTransactionAdded }) {
  const { triggerRefresh } = useRefresh();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Chi');
  const [category, setCategory] = useState('Ăn uống');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

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

    if (!amount || isNaN(numAmount) || numAmount < 1000) {
      setModal({
        show: true,
        type: 'error',
        title: 'Số tiền chưa hợp lệ ⚠️',
        message: 'Số tiền tối thiểu phải từ 1.000 VNĐ trở lên!'
      });
      return; 
    }

    if (numAmount > 1000000000) {
      setModal({
        show: true,
        type: 'error',
        title: 'Số tiền quá lớn ⚠️',
        message: 'Số tiền tối đa không được vượt quá 1 Tỷ VNĐ!'
      });
      return; 
    }

    if (!date) {
      setModal({
        show: true,
        type: 'error',
        title: 'Thiếu ngày giao dịch ⚠️',
        message: 'Vui lòng chọn ngày thực hiện giao dịch!'
      });
      return;
    }

    const selectedYear = new Date(date).getFullYear();
    if (selectedYear < 2000 || selectedYear > 2099) {
      setModal({
        show: true,
        type: 'error',
        title: 'Năm không hợp lệ ⚠️',
        message: 'Vui lòng chọn ngày giao dịch từ năm 2000 đến 2099!'
      });
      return; 
    }

    const newTransaction = {
      amount: numAmount,
      type,
      category,
      date,
      note
    };

    setIsSubmitting(true);

    try {
      const token = getToken();

      const response = await fetch('http://localhost:5001/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        const formattedAmount = numAmount.toLocaleString('vi-VN');
        setModal({
          show: true,
          type: 'success',
          title: 'Lưu giao dịch thành công 🎉',
          message: `Đã ghi nhận giao dịch ${type} ${formattedAmount} đ (${category}).`
        });

        setAmount('');
        setNote('');
        setDate('');
        triggerRefresh();
        if (onTransactionAdded) {
          onTransactionAdded();
        }
      } else {
        const errData = await response.json();
        if (response.status === 401 || (errData.message && errData.message.includes('Token'))) {
          setModal({
            show: true,
            type: 'error',
            title: 'Hết phiên đăng nhập ⚠️',
            message: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!'
          });
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 2000);
          return;
        }
        setModal({
          show: true,
          type: 'error',
          title: 'Lưu thất bại ⚠️',
          message: errData.message || "Có lỗi xảy ra khi lưu giao dịch!"
        });
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setModal({
        show: true,
        type: 'error',
        title: 'Lỗi kết nối ⚠️',
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Loại giao dịch:
          </label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="Chi">🔴 Chi (Chi tiêu)</option>
            <option value="Thu">🟢 Thu (Thu nhập)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Danh mục:
          </label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium"
          >
            <option value="Ăn uống">🍜 Ăn uống</option>
            <option value="Đi lại">🚗 Đi lại</option>
            <option value="Hóa đơn">🧾 Hóa đơn & Tiện ích</option>
            <option value="Mua sắm">🛍️ Mua sắm</option>
            <option value="Giải trí">🎮 Giải trí</option>
            <option value="Lương">💼 Lương & Thu nhập</option>
            <option value="Khác">📌 Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Số tiền (VNĐ):
          </label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            min="1000" 
            max="1000000000"
            placeholder="Ví dụ: 50000"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Ngày giao dịch:
          </label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            min="2000-01-01" 
            max="2099-12-31"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Ghi chú (Tùy chọn):
          </label>
          <input 
            type="text" 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            placeholder="Ví dụ: Ăn trưa bún chả..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold p-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/25 active:scale-95 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu Giao Dịch</span>
            </>
          )}
        </button>
      </form>

      {/* MODAL POPUP THÔNG BÁO UI */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200/50 dark:border-slate-800 text-center relative">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${
              modal.type === 'success' ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-950/80' : 'bg-rose-100 text-rose-500 dark:bg-rose-950/80'
            }`}>
              {modal.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
              {modal.title}
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {modal.message}
            </p>

            <button 
              onClick={() => setModal({ show: false, type: 'success', title: '', message: '' })}
              className={`w-full py-3 rounded-2xl font-bold text-white transition text-xs shadow-md ${
                modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TransactionForm;