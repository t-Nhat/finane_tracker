import React, { useState, useEffect } from 'react';

export default function PiggyBank() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ goalName: '', targetAmount: '', deadline: '' });

  const fetchGoals = async () => {
    const res = await fetch('http://localhost:5000/api/savings-goals');
    const json = await res.json();
    if (json.success) setGoals(json.data);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/savings-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, targetAmount: Number(form.targetAmount) })
    });
    setForm({ goalName: '', targetAmount: '', deadline: '' });
    fetchGoals();
  };

  const handleDeposit = async (id) => {
    const amount = prompt('Nhập số tiền muốn bỏ vào heo (VNĐ):', '100000');
    if (!amount || isNaN(amount)) return;
    await fetch(`http://localhost:5000/api/savings-goals/${id}/deposit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    });
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    if (window.confirm('Đập heo / Xóa mục tiêu này?')) {
      await fetch(`http://localhost:5000/api/savings-goals/${id}`, { method: 'DELETE' });
      fetchGoals();
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Tạo mục tiêu */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-pink-50 p-4 rounded-xl border border-pink-100">
        <input type="text" placeholder="Mục tiêu (VD: Mua xe, Du lịch)..." value={form.goalName} onChange={e => setForm({...form, goalName: e.target.value})} className="p-2 border rounded-lg md:col-span-1" required />
        <input type="number" placeholder="Số tiền cần đạt (VNĐ)" value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})} className="p-2 border rounded-lg md:col-span-1" required />
        <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="p-2 border rounded-lg md:col-span-1" />
        <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-medium p-2 rounded-lg transition">+ Nuôi Heo Mới</button>
      </form>

      {/* Grid Hiển thị Heo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isDone = goal.status === 'COMPLETED' || progress >= 100;
          return (
            <div key={goal._id} className={`p-6 border rounded-2xl shadow-sm relative flex flex-col justify-between ${isDone ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white' : 'bg-white'}`}>
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-3xl">🐷</span>
                  <button onClick={() => deleteGoal(goal._id)} className={isDone ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-rose-500'}>✖</button>
                </div>
                <h4 className="font-bold text-xl mt-3">{goal.goalName}</h4>
                <p className={`text-xs mt-1 ${isDone ? 'text-white/80' : 'text-gray-400'}`}>
                  Hạn: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                </p>

                <div className="mt-6">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>{goal.currentAmount.toLocaleString('vi-VN')} đ</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDone ? 'bg-black/20' : 'bg-gray-100'}`}>
                    <div className={`h-full transition-all duration-500 ${isDone ? 'bg-white' : 'bg-pink-500'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className={`text-xs text-right mt-1 ${isDone ? 'text-white/90 font-bold' : 'text-gray-400'}`}>
                    Mục tiêu: {goal.targetAmount.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-current/10">
                {isDone ? (
                  <div className="text-center font-bold text-sm bg-white text-pink-600 py-2 rounded-xl shadow">
                    🎉 ĐÃ HOÀN THÀNH MỤC TIÊU!
                  </div>
                ) : (
                  <button onClick={() => handleDeposit(goal._id)} className="w-full font-bold bg-pink-50 hover:bg-pink-100 text-pink-600 py-2 rounded-xl transition shadow-sm">
                    + Bỏ Tiền Vào Heo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}