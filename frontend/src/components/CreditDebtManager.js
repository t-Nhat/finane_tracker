import React, { useState, useEffect } from 'react';

export default function CreditDebtManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'CREDIT_CARD', limitAmount: '', currentDebt: '', dueDateDay: '' });

  const fetchItems = async () => {
    const res = await fetch('http://localhost:5000/api/credit-debts');
    const json = await res.json();
    if (json.success) setItems(json.data);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/credit-debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, limitAmount: Number(form.limitAmount), currentDebt: Number(form.currentDebt) })
    });
    setForm({ name: '', type: 'CREDIT_CARD', limitAmount: '', currentDebt: '', dueDateDay: '' });
    fetchItems();
  };

  const handlePay = async (id) => {
    const amount = prompt('Nhập số tiền ông vừa thanh toán cho khoản này (VNĐ):');
    if (!amount || isNaN(amount)) return;
    await fetch(`http://localhost:5000/api/credit-debts/${id}/pay`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payAmount: Number(amount) })
    });
    fetchItems();
  };

  const deleteItem = async (id) => {
    if (window.confirm('Xóa khoản nợ/thẻ này?')) {
      await fetch(`http://localhost:5000/api/credit-debts/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      {/* Form thêm Thẻ / Vay */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
        <input type="text" placeholder="Tên thẻ / Khoản vay..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="p-2 border rounded-lg bg-white">
          <option value="CREDIT_CARD">💳 Thẻ tín dụng</option>
          <option value="BANK_LOAN">🏦 Vay ngân hàng</option>
          <option value="INSTALLMENT">🔄 Trả góp</option>
        </select>
        <input type="number" placeholder="Hạn mức thẻ (nếu có)" value={form.limitAmount} onChange={e => setForm({...form, limitAmount: e.target.value})} className="p-2 border rounded-lg" />
        <input type="number" placeholder="Dư nợ hiện tại" value={form.currentDebt} onChange={e => setForm({...form, currentDebt: e.target.value})} className="p-2 border rounded-lg" required />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium p-2 rounded-lg transition">+ Thêm</button>
      </form>

      {/* Grid danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => {
          const percentUsed = item.limitAmount > 0 ? Math.min(100, Math.round((item.currentDebt / item.limitAmount) * 100)) : 0;
          return (
            <div key={item._id} className="p-5 bg-white border rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {item.type === 'CREDIT_CARD' ? 'Thẻ tín dụng' : item.type === 'BANK_LOAN' ? 'Vay ngân hàng' : 'Trả góp'}
                    </span>
                    <h4 className="font-bold text-lg text-gray-800 mt-2">{item.name}</h4>
                  </div>
                  <button onClick={() => deleteItem(item._id)} className="text-gray-400 hover:text-rose-500">✖</button>
                </div>

                <div className="mt-4 flex justify-between items-baseline">
                  <span className="text-sm text-gray-500">Dư nợ hiện tại:</span>
                  <span className="font-mono font-bold text-xl text-rose-600">{item.currentDebt.toLocaleString('vi-VN')} đ</span>
                </div>

                {/* Progress bar hạn mức (Chỉ hiện cho Thẻ tín dụng) */}
                {item.limitAmount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Hạn mức: {item.limitAmount.toLocaleString('vi-VN')} đ</span>
                      <span className="font-bold">{percentUsed}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${percentUsed > 80 ? 'bg-rose-500' : 'bg-purple-600'}`} style={{ width: `${percentUsed}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t flex justify-between items-center">
                <span className="text-xs text-gray-400">📅 Ngày chốt/trả: Mùng {item.dueDateDay || 15} hàng tháng</span>
                <button onClick={() => handlePay(item._id)} className="text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg transition">
                  💵 Trả nợ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}