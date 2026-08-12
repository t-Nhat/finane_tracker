import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Calendar, DollarSign, Trash2, Plus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api/credit-debts';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  const savedUser = localStorage.getItem('mern_finance_user');
  if (savedUser) {
    try { return JSON.parse(savedUser).token; } catch (e) { return null; }
  }
  return null;
};

export default function CreditDebtManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'CREDIT_CARD', limitAmount: '', currentDebt: '', dueDateDay: '15' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(API_BASE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      } else if (Array.isArray(json)) {
        setItems(json);
      }
    } catch (err) {
      console.error('Lỗi tải thẻ/khoản vay:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...form, 
          limitAmount: Number(form.limitAmount || 0), 
          currentDebt: Number(form.currentDebt || 0) 
        })
      });
      setForm({ name: '', type: 'CREDIT_CARD', limitAmount: '', currentDebt: '', dueDateDay: '15' });
      fetchItems();
    } catch (err) {
      alert('Lỗi thêm khoản vay/thẻ: ' + err.message);
    }
  };

  const handlePay = async (id) => {
    const amount = prompt('Nhập số tiền bạn vừa thanh toán/trả nợ (VNĐ):');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${id}/pay`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payAmount: Number(amount) })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Lỗi trả nợ');
        return;
      }
      alert('Thanh toán thành công!');
      fetchItems();
    } catch (err) {
      alert('Lỗi trả nợ: ' + err.message);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thẻ/khoản vay này?')) {
      try {
        const token = getToken();
        await fetch(`${API_BASE}/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchItems();
      } catch (err) {
        alert('Lỗi xóa: ' + err.message);
      }
    }
  };

  const totalDebtSum = items.reduce((sum, i) => sum + (i.currentDebt || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-violet-500/10 p-6 rounded-3xl border border-purple-200/40 dark:border-purple-900/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Quản Lý Thẻ Tín Dụng & Nợ Vay
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Theo dõi hạn mức thẻ credit, dư nợ vay ngân hàng và lịch thanh toán định kỳ</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm self-stretch sm:self-auto flex items-center justify-between sm:justify-start gap-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Tổng Dư Nợ:</span>
          <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-lg">
            {totalDebtSum.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* FORM THÊM KHOẢN VAY / THẺ MỚI */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <input 
          type="text" 
          placeholder="Tên thẻ / Khoản vay..." 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})} 
          className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" 
          required 
        />
        <select 
          value={form.type} 
          onChange={e => setForm({...form, type: e.target.value})} 
          className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-medium"
        >
          <option value="CREDIT_CARD">💳 Thẻ tín dụng</option>
          <option value="BANK_LOAN">🏦 Vay ngân hàng</option>
          <option value="INSTALLMENT">🔄 Mua trả góp</option>
        </select>
        <input 
          type="number" 
          placeholder="Hạn mức thẻ (nếu có)" 
          value={form.limitAmount} 
          onChange={e => setForm({...form, limitAmount: e.target.value})} 
          className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" 
        />
        <input 
          type="number" 
          placeholder="Dư nợ hiện tại (VNĐ)" 
          value={form.currentDebt} 
          onChange={e => setForm({...form, currentDebt: e.target.value})} 
          className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40" 
          required 
        />
        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold p-3 rounded-2xl transition shadow-lg shadow-purple-500/25 active:scale-95 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khoản Nợ</span>
        </button>
      </form>

      {/* GRID KHOẢN NỢ & THẺ */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
          <CreditCard className="w-12 h-12 mx-auto text-purple-300 dark:text-purple-900 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Không có thẻ hoặc dư nợ nào!</h3>
          <p className="text-xs text-slate-400 mt-1">Hệ thống ghi nhận bạn đang không có dư nợ thẻ hoặc khoản vay ngân hàng nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => {
            const limit = item.limitAmount || 0;
            const debt = item.currentDebt || 0;
            const percentUsed = limit > 0 ? Math.min(100, Math.round((debt / limit) * 100)) : 0;
            const isHighRisk = percentUsed >= 80;

            return (
              <div 
                key={item._id} 
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
                        {item.type === 'CREDIT_CARD' ? <CreditCard className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                        {item.type === 'CREDIT_CARD' ? 'Thẻ Tín Dụng' : item.type === 'BANK_LOAN' ? 'Vay Ngân Hàng' : 'Trả Góp'}
                      </span>
                      <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mt-3">{item.name}</h4>
                    </div>

                    <button 
                      onClick={() => deleteItem(item._id)} 
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Xóa bản ghi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Dư nợ hiện tại:</span>
                    <span className="font-mono font-extrabold text-xl text-rose-600 dark:text-rose-400">
                      {debt.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {limit > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                        <span>Hạn mức: <strong className="text-slate-700 dark:text-slate-300 font-mono">{limit.toLocaleString('vi-VN')} đ</strong></span>
                        <span className={`font-mono font-bold ${isHighRisk ? 'text-rose-600' : 'text-purple-600'}`}>{percentUsed}%</span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isHighRisk ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`} 
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>

                      {isHighRisk && (
                        <p className="text-[11px] font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Cảnh báo: Đã sử dụng trên 80% hạn mức thẻ!</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Hạn chốt/trả: Ngày {item.dueDateDay || 15} hàng tháng</span>
                  </div>

                  <button 
                    onClick={() => handlePay(item._id)} 
                    className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white dark:hover:text-white px-4 py-2.5 rounded-xl transition active:scale-95 border border-emerald-200/60 dark:border-emerald-800/60 self-end sm:self-auto"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Thanh Toán / Trả Nợ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}