import React, { useState, useEffect } from 'react';
import { PiggyBank as PiggyIcon, Plus, Minus, Trash2, Calendar, Target, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useRefresh } from '../context/RefreshContext';

const API_BASE = 'http://localhost:5001/api/savings-goals';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  const savedUser = localStorage.getItem('mern_finance_user');
  if (savedUser) {
    try { return JSON.parse(savedUser).token; } catch (e) { return null; }
  }
  return null;
};

export default function PiggyBank() {
  const { triggerRefresh } = useRefresh();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ goalName: '', targetAmount: '', deadline: '' });
  const [actionModal, setActionModal] = useState({ show: false, type: 'deposit', goal: null, amount: '' });
  const [toastModal, setToastModal] = useState({ show: false, type: 'success', title: '', message: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, currentAmount: 0, goalName: '' });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(API_BASE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setGoals(json.data);
      } else if (Array.isArray(json)) {
        setGoals(json);
      }
    } catch (err) {
      console.error('Lỗi tải mục tiêu tiết kiệm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

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
        body: JSON.stringify({ ...form, targetAmount: Number(form.targetAmount) })
      });
      setForm({ goalName: '', targetAmount: '', deadline: '' });
      setToastModal({ show: true, type: 'success', title: 'Tạo heo thành công 🐷', message: 'Mục tiêu tiết kiệm mới đã được thiết lập.' });
      fetchGoals();
    } catch (err) {
      setToastModal({ show: true, type: 'error', title: 'Lỗi tạo mục tiêu', message: err.message });
    }
  };

  const openActionModal = (goal, type) => {
    setActionModal({ show: true, type, goal, amount: '' });
  };

  const executeAction = async () => {
    const { type, goal, amount } = actionModal;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setToastModal({ show: true, type: 'error', title: 'Số tiền không hợp lệ', message: 'Vui lòng nhập số tiền lớn hơn 0 đ.' });
      return;
    }
    try {
      const token = getToken();
      const endpoint = type === 'deposit' ? 'deposit' : 'withdraw';
      const res = await fetch(`${API_BASE}/${goal._id}/${endpoint}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionModal({ show: false, type: 'deposit', goal: null, amount: '' });
        setToastModal({ show: true, type: 'error', title: type === 'deposit' ? 'Lỗi nạp tiền' : 'Lỗi rút tiền', message: json.message || 'Thao tác không thành công!' });
        return;
      }
      setActionModal({ show: false, type: 'deposit', goal: null, amount: '' });
      setToastModal({ 
        show: true, 
        type: 'success', 
        title: type === 'deposit' ? 'Nạp tiền thành công 🐷' : 'Rút tiền thành công 💸', 
        message: type === 'deposit' 
          ? `Đã nạp ${Number(amount).toLocaleString('vi-VN')} đ vào heo "${goal.goalName}".` 
          : `Đã rút ${Number(amount).toLocaleString('vi-VN')} đ từ heo "${goal.goalName}".`
      });
      fetchGoals();
      triggerRefresh();
    } catch (err) {
      setActionModal({ show: false, type: 'deposit', goal: null, amount: '' });
      setToastModal({ show: true, type: 'error', title: 'Lỗi kết nối', message: err.message });
    }
  };

  const openDeleteModal = (goal) => {
    setDeleteModal({ show: true, id: goal._id, currentAmount: goal.currentAmount || 0, goalName: goal.goalName });
  };

  const executeDeleteGoal = async () => {
    const { id } = deleteModal;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setDeleteModal({ show: false, id: null, currentAmount: 0, goalName: '' });
      if (json.success) {
        setToastModal({ 
          show: true, 
          type: 'success', 
          title: 'Xóa heo thành công 🎉', 
          message: json.message || 'Mục tiêu đã được xóa khỏi danh sách.' 
        });
      } else {
        setToastModal({ show: true, type: 'error', title: 'Lỗi xóa', message: json.message || 'Không thể xóa mục tiêu' });
      }
      fetchGoals();
      triggerRefresh();
    } catch (err) {
      setDeleteModal({ show: false, id: null, currentAmount: 0, goalName: '' });
      setToastModal({ show: true, type: 'error', title: 'Lỗi xóa mục tiêu', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 p-6 rounded-3xl border border-pink-200/40 dark:border-pink-900/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
            <PiggyIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Nuôi Heo Tiết Kiệm
              <Sparkles className="w-4 h-4 text-pink-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Đặt mục tiêu tài chính, tích lũy từng ngày và theo dõi ước mơ của bạn</p>
          </div>
        </div>
      </div>

      {/* FORM TẠO MỤC TIÊU MỚI */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="relative md:col-span-1">
          <input 
            type="text" 
            placeholder="Tên mục tiêu (VD: Mua Laptop, Du lịch)..." 
            value={form.goalName} 
            onChange={e => setForm({...form, goalName: e.target.value})} 
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40" 
            required 
          />
        </div>
        <div className="relative md:col-span-1">
          <input 
            type="number" 
            placeholder="Số tiền mục tiêu (VNĐ)" 
            value={form.targetAmount} 
            onChange={e => setForm({...form, targetAmount: e.target.value})} 
            ref={el => {
              if (el) {
                el.onwheel = (e) => {
                  e.preventDefault();
                  const current = Number(form.targetAmount || 0);
                  const next = Math.max(0, e.deltaY < 0 ? current + 1000 : current - 1000);
                  setForm(prev => ({ ...prev, targetAmount: next }));
                };
              }
            }}
            step="1000"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40" 
            required 
          />
        </div>
        <div className="relative md:col-span-1">
          <input 
            type="date" 
            value={form.deadline} 
            onChange={e => setForm({...form, deadline: e.target.value})} 
            min="2000-01-01"
            max="2099-12-31"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40" 
          />
        </div>
        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold p-3 rounded-2xl transition shadow-lg shadow-pink-500/25 active:scale-95 text-xs sm:text-sm md:col-span-1"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mục Tiêu Mới</span>
        </button>
      </form>

      {/* GRID MỤC TIÊU TIẾT KIỆM */}
      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
          <PiggyIcon className="w-12 h-12 mx-auto text-pink-300 dark:text-pink-900 mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Chưa có chú heo tiết kiệm nào!</h3>
          <p className="text-xs text-slate-400 mt-1">Hãy nhập tên mục tiêu và số tiền cần đạt ở trên để bắt đầu nuôi heo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const current = goal.currentAmount || 0;
            const target = goal.targetAmount || 1;
            const progress = Math.min(100, Math.round((current / target) * 100));
            const isDone = goal.status === 'COMPLETED' || progress >= 100;

            return (
              <div 
                key={goal._id} 
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md ${
                  isDone 
                    ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white border-pink-400' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-500 flex items-center justify-center text-2xl font-bold">
                      🐷
                    </div>
                    <button 
                      onClick={() => openDeleteModal(goal)} 
                      className={`p-2 rounded-xl transition ${isDone ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'}`}
                      title="Xóa mục tiêu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-extrabold text-lg tracking-tight mb-1">{goal.goalName}</h4>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${isDone ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Hạn: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}</span>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-baseline mb-2 text-xs font-bold">
                      <span className={isDone ? 'text-white' : 'text-pink-600 dark:text-pink-400 font-mono text-sm'}>
                        {current.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="font-mono text-sm">{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 ${isDone ? 'bg-black/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-white shadow-md' : 'bg-gradient-to-r from-pink-500 to-rose-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className={`flex justify-between text-[11px] mt-2 font-medium ${isDone ? 'text-white/80' : 'text-slate-400'}`}>
                      <span>Mục tiêu:</span>
                      <span className="font-mono font-bold">{target.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {isDone ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2 font-bold text-xs bg-white text-pink-600 py-2.5 rounded-2xl shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>🎉 ĐÃ HOÀN THÀNH MỤC TIÊU!</span>
                      </div>
                      {current > 0 && (
                        <button 
                          onClick={() => openActionModal(goal, 'withdraw')} 
                          className="w-full flex items-center justify-center gap-1.5 font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 py-2.5 rounded-2xl transition duration-200 text-xs shadow-sm active:scale-95 border border-amber-200/60 dark:border-amber-800/60"
                        >
                          <Minus className="w-4 h-4" />
                          <span>Rút Tiền</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => openActionModal(goal, 'deposit')} 
                        className="flex items-center justify-center gap-1 font-bold bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-500 hover:text-white text-pink-600 dark:text-pink-400 py-2.5 rounded-2xl transition duration-200 text-xs shadow-sm active:scale-95 border border-pink-200/60 dark:border-pink-800/60"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nạp Tiền</span>
                      </button>
                      <button 
                        onClick={() => openActionModal(goal, 'withdraw')} 
                        disabled={current <= 0}
                        className={`flex items-center justify-center gap-1 font-bold py-2.5 rounded-2xl transition duration-200 text-xs shadow-sm border ${
                          current > 0 
                            ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60 active:scale-95' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                        <span>Rút Tiền</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* MODAL NẠP / RÚT TIỀN HEO */}
      {actionModal.show && actionModal.goal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800 relative">
            <button 
              onClick={() => setActionModal({ show: false, type: 'deposit', goal: null, amount: '' })}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-pink-500 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/80 flex items-center justify-center text-xl">
                {actionModal.type === 'deposit' ? '🐷' : '💸'}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {actionModal.type === 'deposit' ? 'Nạp Tiền Vào Heo' : 'Rút Tiền Từ Heo'}
                </h3>
                <p className="text-xs text-slate-400">{actionModal.goal.goalName}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-5 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Hiện có trong heo:</span>
              <span className="font-mono font-extrabold text-pink-600 dark:text-pink-400 text-base">
                {(actionModal.goal.currentAmount || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nhập số tiền muốn {actionModal.type === 'deposit' ? 'nạp' : 'rút'} (VNĐ):
            </label>
            <input 
              type="number"
              placeholder="VD: 100000"
              value={actionModal.amount}
              onChange={e => setActionModal({ ...actionModal, amount: e.target.value })}
              ref={el => {
                if (el) {
                  el.onwheel = (e) => {
                    e.preventDefault();
                    const current = Number(actionModal.amount || 0);
                    const next = Math.max(0, e.deltaY < 0 ? current + 1000 : current - 1000);
                    setActionModal(prev => ({ ...prev, amount: next }));
                  };
                }
              }}
              step="1000"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/40 mb-4"
              autoFocus
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[50000, 100000, 500000, 1000000].map((val, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActionModal({ ...actionModal, amount: val })}
                  className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-800/50 hover:bg-pink-500 hover:text-white transition"
                >
                  +{(val / 1000).toLocaleString('vi-VN')}k
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setActionModal({ show: false, type: 'deposit', goal: null, amount: '' })}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition text-xs"
              >
                Hủy
              </button>
              <button 
                onClick={executeAction}
                className={`flex-1 py-3 text-white rounded-xl font-bold transition text-xs shadow-lg active:scale-95 ${
                  actionModal.type === 'deposit'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20'
                }`}
              >
                Xác Nhận {actionModal.type === 'deposit' ? 'Nạp' : 'Rút'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA HEO */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Xóa Mục Tiêu Tiết Kiệm</h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
              {deleteModal.currentAmount > 0 ? (
                <>
                  Bạn có chắc muốn xóa chú heo <strong>"{deleteModal.goalName}"</strong>? Số tiền <strong className="text-emerald-500">{(deleteModal.currentAmount).toLocaleString('vi-VN')} đ</strong> đang tích lũy sẽ được <strong>hoàn tự động về tài khoản Ví</strong> của bạn.
                </>
              ) : (
                <>Bạn có chắc chắn muốn xóa chú heo <strong>"{deleteModal.goalName}"</strong> khỏi danh sách?</>
              )}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, currentAmount: 0, goalName: '' })}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition text-xs"
              >
                Hủy
              </button>
              <button 
                onClick={executeDeleteGoal}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition text-xs shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Xóa Mục Tiêu
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
              toastModal.type === 'success' ? 'bg-pink-100 text-pink-500 dark:bg-pink-950/80' : 'bg-rose-100 text-rose-500 dark:bg-rose-950/80'
            }`}>
              {toastModal.type === 'success' ? <CheckCircle2 className="w-8 h-8 text-pink-500" /> : <AlertCircle className="w-8 h-8" />}
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
                toastModal.type === 'success' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-rose-600 hover:bg-rose-700'
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