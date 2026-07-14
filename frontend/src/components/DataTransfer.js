import React, { useState } from 'react';

export default function DataTransfer() {
  const [importMode, setImportMode] = useState('MERGE'); // 'MERGE' | 'OVERWRITE'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Xử lý tải file JSON xuống máy
  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/data-transfer/export');
      const json = await res.json();
      
      if (json.success) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `finance_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setMessage({ type: 'success', text: '📥 Tải file dữ liệu backup xuống thành công!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Lỗi xuất dữ liệu: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đọc và gửi file JSON lên server
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        const parsedData = JSON.parse(event.target.result);
        
        const confirmMsg = importMode === 'OVERWRITE' 
          ? '⚠️ CẢNH BÁO: Chế độ Ghi Đè sẽ xóa hết dữ liệu hiện tại để thay bằng file mới. Ông có chắc chắn không?'
          : 'Ông muốn gộp dữ liệu từ file vào hệ thống?';
          
        if (!window.confirm(confirmMsg)) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/data-transfer/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ importData: parsedData, mode: importMode })
        });
        const json = await res.json();

        if (json.success) {
          setMessage({ type: 'success', text: '✅ ' + json.message });
          setTimeout(() => window.location.reload(), 1500); // Nạp lại trang để cập nhật UI
        } else {
          setMessage({ type: 'error', text: '❌ ' + json.message });
        }
      } catch (err) {
        setMessage({ type: 'error', text: '❌ File JSON lỗi hoặc không đúng định dạng!' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khung Xuất Dữ Liệu */}
        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
              📤
            </div>
            <h4 className="font-bold text-gray-800 text-lg">Xuất Dữ Liệu Backup</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Tải toàn bộ lịch sử chi tiêu, hạn mức, vay mượn và heo tiết kiệm xuống máy dưới dạng file chuẩn `.json`.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            {loading ? 'Đang xử lý...' : '📥 Tải Xuống File .JSON'}
          </button>
        </div>

        {/* Khung Nhập Dữ Liệu */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold mb-3 shadow-sm">
              📥
            </div>
            <h4 className="font-bold text-gray-800 text-lg">Phục Hồi / Nhập File</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Chọn file `.json` đã tải trước đó để khôi phục vào hệ thống.
            </p>

            <div className="mt-3 flex gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={importMode === 'MERGE'}
                  onChange={() => setImportMode('MERGE')}
                  className="text-indigo-600"
                />
                <span>Gộp thêm vào DB</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-rose-600">
                <input
                  type="radio"
                  name="mode"
                  checked={importMode === 'OVERWRITE'}
                  onChange={() => setImportMode('OVERWRITE')}
                />
                <span>Ghi đè toàn bộ</span>
              </label>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="sr-only">Chọn file JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900 cursor-pointer transition"
            />
          </label>
        </div>
      </div>
    </div>
  );
}