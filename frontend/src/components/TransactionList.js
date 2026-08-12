import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [toastModal, setToastModal] = useState({ show: false, type: 'success', title: '', message: '' });

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = getToken();

      const response = await fetch('http://localhost:5001/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('mern_finance_user');
        localStorage.clear();
        window.location.reload();
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (data.data && Array.isArray(data.data)) {
        setTransactions(data.data);
      } else {
        console.error("Dữ liệu trả về không hợp lệ:", data);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setTransactions([]);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ show: true, id });
  };

  const executeDelete = async () => {
    const { id } = deleteModal;
    try {
      const token = getToken();

      const response = await fetch(`http://localhost:5001/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setDeleteModal({ show: false, id: null });
      if (response.ok) {
        setToastModal({ show: true, type: 'success', title: 'Xóa giao dịch thành công 🎉', message: 'Giao dịch đã được xóa khỏi danh sách.' });
        fetchTransactions();
      } else {
        const errData = await response.json();
        setToastModal({ show: true, type: 'error', title: 'Không thể xóa ⚠️', message: errData.message || 'Không thể xóa giao dịch này.' });
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      setDeleteModal({ show: false, id: null });
      setToastModal({ show: true, type: 'error', title: 'Lỗi khi xóa ⚠️', message: error.message });
    }
  };

  return (
    <div className="transaction-list">
      {(!transactions || transactions.length === 0) ? (
        <p className="text-xs text-slate-400 py-8 text-center">Chưa có giao dịch nào. Hãy thêm mới nhé!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Ngày</th>
                <th className="pb-3">Loại</th>
                <th className="pb-3">Danh mục</th>
                <th className="pb-3">Số tiền</th>
                <th className="pb-3">Ghi chú</th>
                <th className="pb-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString('vi-VN') : ''}
                  </td>
                  <td className="py-3">
                    <span className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                      (transaction.type === 'Thu' || transaction.type === 'Rút tiết kiệm')
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : transaction.type === 'Tiết kiệm'
                        ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{transaction.category}</td>
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {transaction.amount ? transaction.amount.toLocaleString('vi-VN') : 0} đ
                  </td>
                  <td className="py-3 text-slate-400 max-w-[150px] truncate">{transaction.note || '-'}</td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => openDeleteModal(transaction._id)} 
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Xóa giao dịch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200/50 dark:border-slate-800 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-500 dark:bg-rose-950/80 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
              Xóa giao dịch này?
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Giao dịch sẽ bị xóa vĩnh viễn khỏi lịch sử thu chi của bạn.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition text-xs"
              >
                Hủy
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition text-xs shadow-md active:scale-95"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO POPUP */}
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

export default TransactionList;