import React, { useState, useEffect } from 'react';

export default function LoanManager() {
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('LEND'); // 'LEND' | 'BORROW'
  const [formData, setFormData] = useState({ personName: '', amount: '', dueDate: '', note: '' });

  const fetchLoans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/loans');
      const json = await res.json();
      if (json.success) setLoans(json.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu vay mượn:', err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.personName || !formData.amount) return;
    try {
      await fetch('http://localhost:5000/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeTab, amount: Number(formData.amount) })
      });
      setFormData({ personName: '', amount: '', dueDate: '', note: '' });
      fetchLoans();
    } catch (err) {
      console.error('Lỗi thêm dữ liệu:', err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'PAID' : 'PENDING';
    await fetch(`http://localhost:5000/api/loans/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    fetchLoans();
  };

  const deleteLoan = async (id) => {
    if (!window.confirm('Ông có chắc muốn xóa khoản này?')) return;
    await fetch(`http://localhost:5000/api/loans/${id}`, { method: 'DELETE' });
    fetchLoans();
  };

  const filteredLoans = loans.filter(item => item.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Nút chuyển tab Cho mượn / Đang nợ */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab('LEND')}
          className={`flex-1 py-2 font-semibold rounded-lg transition ${activeTab === 'LEND' ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ↗️ Tiền Cho Mượn
        </button>
        <button
          onClick={() => setActiveTab('BORROW')}
          className={`flex-1 py-2 font-semibold rounded-lg transition ${activeTab === 'BORROW' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ↙️ Tiền Đang Nợ
        </button>
      </div>

      {/* Form thêm mới */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <input
          type="text"
          placeholder={activeTab === 'LEND' ? 'Tên người mượn...' : 'Tên chủ nợ...'}
          value={formData.personName}
          onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
          className="p-2 border rounded-lg md:col-span-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="number"
          placeholder="Số tiền (VNĐ)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="p-2 border rounded-lg md:col-span-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="p-2 border rounded-lg md:col-span-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button type="submit" className="bg-slate-800 text-white font-medium p-2 rounded-lg hover:bg-slate-900 transition">
          + Thêm Khoản
        </button>
      </form>

      {/* Danh sách hiển thị */}
      <div className="space-y-3">
        {filteredLoans.length === 0 && <p className="text-center text-gray-400 py-4 italic">Chưa có ghi nhớ nào ở mục này!</p>}
        {filteredLoans.map((item) => (
          <div key={item._id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{item.personName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status === 'PAID' ? 'Đã thanh toán' : 'Chưa trả'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Hạn trả: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className={`font-mono text-lg font-bold ${activeTab === 'LEND' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.amount.toLocaleString('vi-VN')} đ
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleStatus(item._id, item.status)}
                  className="p-2 text-sm bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-lg transition"
                  title="Đổi trạng thái"
                >
                  ✔
                </button>
                <button
                  onClick={() => deleteLoan(item._id)}
                  className="p-2 text-sm bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-700 rounded-lg transition"
                  title="Xóa"
                >
                  ✖
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}