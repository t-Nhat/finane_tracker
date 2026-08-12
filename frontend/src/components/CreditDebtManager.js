import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Calendar, DollarSign, Trash2, Plus, AlertCircle, CheckCircle2, ShieldAlert, X, Info } from 'lucide-react';

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
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [payModal, setPayModal] = useState({ show: false, item: null, amount: '' });
  const [toastModal, setToastModal] = useState({ show: false, type: 'success', title: '', message: '' });

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
      setToastModal({ show: true, type: 'success', title: 'Tạo thành công 🎉', message: 'Đã thêm khoản nợ/thẻ mới vào hệ thống.' });
      fetchItems();
    } catch (err) {
      setToastModal({ show: true, type: 'error', title: 'Lỗi thêm khoản vay/thẻ', message: err.message });
    }
  };

  const openPayModal = (item) => {
    setPayModal({ show: true, item, amount: '' });
  };

  const executePay = async () => {
    if (!payModal.amount || isNaN(payModal.amount) || Number(payModal.amount) <= 0) {
      setToastModal({ show: true, type: 'error', title: 'Số tiền không hợp lệ', message: 'Vui lòng nhập số tiền thanh toán lớn hơn 0 đ.' });
      return;
    }
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${payModal.item._id}/pay`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payAmount: Number(payModal.amount) })
      });
      const data = await res.json();
      if (!data.success) {
        setPayModal({ show: false, item: null, amount: '' });
        setToastModal({ show: true, type: 'error', title: 'Thanh toán thất bại', message: data.message || 'Lỗi trả nợ' });
        return;
      }
      setPayModal({ show: false, item: null, amount: '' });
      setToastModal({ 
        show: true, 
        type: 'success', 
        title: 'Thanh toán thành công 🎉', 
        message: `Đã trả ${Number(payModal.amount).toLocaleString('vi-VN')} đ cho ${payModal.item.name}. Dư nợ đã được giảm!` 
      });
      fetchItems();
    } catch (err) {
      setPayModal({ show: false, item: null, amount: '' });
      setToastModal({ show: true, type: 'error', title: 'Lỗi hệ thống', message: err.message });
    }
  };

  const deleteItem = async (id, action = 'direct') => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${id}?action=${action}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        setToastModal({ show: true, type: 'error', title: 'Lỗi xóa', message: data.message });
        return;
      }
      setDeleteModal({ show: false, item: null });
      setToastModal({ show: true, type: 'success', title: 'Xóa thành công 🎉', message: 'Đã xóa bản ghi khỏi danh sách.' });
      fetchItems();
    } catch (err) {
      setToastModal({ show: true, type: 'error', title: 'Lỗi xóa', message: err.message });
    }
  };

  const handleDeleteClick = (item) => {
    if ((item.currentDebt || 0) === 0) {
      deleteItem(item._id, 'direct');
    } else {
      setDeleteModal({ show: true, item });
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
                      onClick={() => handleDeleteClick(item)} 
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
                    onClick={() => openPayModal(item)} 
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
      {/* MODAL NHẬP TIỀN THANH TOÁN */}
      {payModal.show && payModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800 relative">
            <button 
              onClick={() => setPayModal({ show: false, item: null, amount: '' })}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Thanh Toán Nợ</h3>
                <p className="text-xs text-slate-400">{payModal.item.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-5 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Dư nợ cần trả:</span>
              <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-base">
                {(payModal.item.currentDebt || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nhập số tiền muốn trả (VNĐ):
            </label>
            <input 
              type="number"
              placeholder="VD: 500000"
              value={payModal.amount}
              onChange={e => setPayModal({ ...payModal, amount: e.target.value })}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 mb-4"
              autoFocus
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[100000, 500000, 1000000, payModal.item.currentDebt || 0].map((val, idx) => (
                val > 0 && (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPayModal({ ...payModal, amount: val })}
                    className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-600 hover:text-white transition"
                  >
                    {idx === 3 ? 'Trả hết' : `${(val / 1000).toLocaleString('vi-VN')}k`}
                  </button>
                )
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setPayModal({ show: false, item: null, amount: '' })}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition text-xs"
              >
                Hủy
              </button>
              <button 
                onClick={executePay}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition text-xs shadow-lg shadow-purple-500/20 active:scale-95"
              >
                Xác Nhận Trả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÓA */}
      {deleteModal.show && deleteModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thẻ vẫn còn dư nợ!</h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
              Thẻ/khoản vay <strong>{deleteModal.item.name}</strong> vẫn còn dư nợ <strong className="text-rose-500">{(deleteModal.item.currentDebt || 0).toLocaleString('vi-VN')} đ</strong>. Bạn muốn xử lý thế nào?
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => deleteItem(deleteModal.item._id, 'payoff')}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-between transition text-xs sm:text-sm"
              >
                <div className="flex flex-col items-start">
                  <span>Tất toán & Xóa</span>
                  <span className="text-[11px] opacity-80 font-normal">Trừ tiền trong Ví & tạo giao dịch Chi</span>
                </div>
                <CheckCircle2 className="w-5 h-5" />
              </button>

              <button 
                onClick={() => deleteItem(deleteModal.item._id, 'ignore')}
                className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-between transition text-xs sm:text-sm"
              >
                <div className="flex flex-col items-start">
                  <span>Xóa sổ (Bỏ qua nợ)</span>
                  <span className="text-[11px] opacity-80 font-normal">Không trừ tiền trong Ví, chỉ xóa thẻ</span>
                </div>
                <Trash2 className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setDeleteModal({ show: false, item: null })}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition mt-2 text-xs"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO POPUP (SUCCESS / ERROR TOAST) */}
      {toastModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200/50 dark:border-slate-800 text-center relative">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${
              toastModal.type === 'success' ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-950/80' : 'bg-rose-100 text-rose-500 dark:bg-rose-950/80'
            }`}>
              {toastModal.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
              {toastModal.title}
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {toastModal.message}
            </p>

            <button 
              onClick={() => setToastModal({ show: false, type: 'success', title: '', message: '' })}
              className={`w-full py-3 rounded-2xl font-bold text-white transition text-xs shadow-md ${
                toastModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </div>
  );
}