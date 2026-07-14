import React, { useState, useEffect } from 'react';

export default function BackupHistory() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const fetchSnapshots = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/backups');
      const json = await res.json();
      if (json.success) setSnapshots(json.data);
    } catch (err) {
      console.error('Lỗi tải danh sách backup:', err);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteInput || undefined })
      });
      const json = await res.json();
      if (json.success) {
        setNoteInput('');
        fetchSnapshots();
      }
    } catch (err) {
      alert('Lỗi khi tạo sao lưu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, note) => {
    if (!window.confirm(`⚠️ CẢNH BÁO: Hệ thống sẽ quay trở lại trạng thái của bản [${note}]. Toàn bộ dữ liệu nhập sau thời điểm đó sẽ mất. Ông chắc chứ?`)) return;
    
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/backups/restore/${id}`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('✅ ' + json.message);
        window.location.reload();
      }
    } catch (err) {
      alert('Lỗi phục hồi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bản lưu lịch sử này?')) return;
    await fetch(`http://localhost:5000/api/backups/${id}`, { method: 'DELETE' });
    fetchSnapshots();
  };

  return (
    <div className="space-y-6">
      {/* Form tạo Snapshot nhanh */}
      <form onSubmit={handleCreateSnapshot} className="flex gap-3 bg-slate-100/80 p-4 rounded-xl border border-slate-200">
        <input
          type="text"
          placeholder="Ghi chú bản lưu (VD: Trước khi xóa số liệu tháng 6)..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white text-xs font-semibold rounded-xl transition shadow-sm whitespace-nowrap"
        >
          {loading ? 'Đang lưu...' : '+ Tạo Bản Sao Lưu Ngay'}
        </button>
      </form>

      {/* Danh sách 30 Snapshot */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Lịch Sử Sao Lưu ({snapshots.length} / 30 tối đa)
          </span>
          <span className="text-[11px] text-gray-400 italic">Tự động xóa bản cũ nhất khi vượt 30</span>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-center py-10 bg-white border border-dashed rounded-2xl text-gray-400 text-sm">
            Chưa có bản sao lưu nào được ghi nhận. Hãy tạo bản đầu tiên!
          </div>
        ) : (
          <div className="divide-y border rounded-2xl bg-white overflow-hidden shadow-sm">
            {snapshots.map((item, idx) => (
              <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h5 className="font-bold text-gray-800 text-sm">{item.note}</h5>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    ID: #{item._id.slice(-6)} | {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(item._id, item.note)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white text-xs font-semibold rounded-lg transition active:scale-95"
                  >
                    🔄 Phục hồi
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={loading}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
                    title="Xóa bản ghi"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}