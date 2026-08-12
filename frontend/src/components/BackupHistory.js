import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Trash2, History, HardDrive, ShieldCheck } from 'lucide-react';

export default function BackupHistory() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const fetchSnapshots = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/backups');
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
      const res = await fetch('http://localhost:5001/api/backups', {
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
    if (!window.confirm(`⚠️ CẢNH BÁO: Hệ thống sẽ quay trở lại trạng thái của bản [${note}]. Toàn bộ dữ liệu nhập sau thời điểm đó sẽ mất. Bạn có chắc chắn không?`)) return;
    
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/backups/restore/${id}`, { method: 'POST' });
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
    await fetch(`http://localhost:5001/api/backups/${id}`, { method: 'DELETE' });
    fetchSnapshots();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sao Lưu & Phục Hồi Dữ Liệu</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tạo bản chụp dữ liệu định kỳ để phòng ngừa sự cố hoặc mất dữ liệu</p>
        </div>
      </div>

      {/* Form tạo Snapshot nhanh */}
      <form onSubmit={handleCreateSnapshot} className="flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ghi chú bản lưu (VD: Trước khi xóa số liệu tháng 6)..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="w-full p-3 pl-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 whitespace-nowrap disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Đang tạo sao lưu...' : 'Tạo Bản Sao Lưu Ngay'}</span>
        </button>
      </form>

      {/* Danh sách 30 Snapshot */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lịch Sử Sao Lưu ({snapshots.length} / 30 tối đa)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Tự động xóa bản cũ nhất khi vượt quá 30 bản lưu</span>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-sm">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-medium">Chưa có bản sao lưu nào được ghi nhận.</p>
            <p className="text-xs text-slate-400 mt-1">Hãy nhập ghi chú và bấm "Tạo Bản Sao Lưu Ngay" ở trên.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            {snapshots.map((item) => (
              <div key={item._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.note || 'Bản sao lưu không tên'}</h5>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    ID: #{item._id.slice(-6)} • {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleRestore(item._id, item.note)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white dark:hover:text-white text-xs font-bold rounded-xl transition active:scale-95 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Phục hồi</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                    title="Xóa bản ghi"
                  >
                    <Trash2 className="w-4 h-4" />
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