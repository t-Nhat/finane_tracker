import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft, FolderOpen } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const API_BASE = 'http://localhost:5001/api/data-transfer';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  const savedUser = localStorage.getItem('mern_finance_user');
  if (savedUser) {
    try { return JSON.parse(savedUser).token; } catch (e) { return null; }
  }
  return null;
};

export default function DataTransfer() {
  const [importMode, setImportMode] = useState('MERGE'); // 'MERGE' | 'OVERWRITE'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.success) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `finance_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setMessage({ type: 'success', text: '📥 Tải file dữ liệu backup JSON xuống máy thành công!' });
      } else {
        setMessage({ type: 'error', text: '❌ ' + (json.message || 'Lỗi xuất dữ liệu') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Lỗi xuất dữ liệu: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async (parsedData) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ importData: parsedData, mode: importMode })
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: 'success', text: '✅ ' + json.message });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: '❌ ' + json.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Lỗi kết nối hoặc xử lý nhập dữ liệu!' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFileName('');
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        
        const confirmMsg = importMode === 'OVERWRITE' 
          ? '⚠️ CẢNH BÁO: Chế độ Ghi Đè sẽ XÓA HẾT dữ liệu hiện tại để thay bằng file mới. Bạn có chắc chắn không?'
          : 'Bạn muốn GỘP thêm dữ liệu từ file JSON này vào hệ thống?';
          
        setConfirmConfig({
          isOpen: true,
          title: importMode === 'OVERWRITE' ? 'Xác Nhận Ghi Đè' : 'Xác Nhận Gộp Dữ Liệu',
          message: confirmMsg,
          onConfirm: () => executeImport(parsedData)
        });

      } catch (err) {
        setMessage({ type: 'error', text: '❌ File JSON lỗi hoặc không đúng định dạng!' });
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <FileJson className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Xuất & Nhập File Dữ Liệu Backup</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Xuất file dữ liệu chuẩn JSON để lưu giữ hoặc khôi phục lên thiết bị mới</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khung Xuất Dữ Liệu */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-4 shadow-lg shadow-indigo-600/20">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Xuất File Backup JSON</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Tải toàn bộ lịch sử thu chi, danh mục, khoản vay mượn và heo tiết kiệm xuống máy dưới dạng file chuẩn `.json`.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{loading ? 'Đang xuất dữ liệu...' : 'Tải File Backup .JSON'}</span>
          </button>
        </div>

        {/* Khung Nhập Dữ Liệu */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold mb-4 shadow-lg shadow-teal-600/20">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Khôi Phục Dữ Liệu Từ File</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Chọn file `.json` đã tải trước đó để nạp lại dữ liệu vào ứng dụng.
            </p>

            <div className="mt-4 flex gap-4 text-xs font-semibold p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="mode"
                  checked={importMode === 'MERGE'}
                  onChange={() => setImportMode('MERGE')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Gộp thêm vào hệ thống</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-rose-600 dark:text-rose-400">
                <input
                  type="radio"
                  name="mode"
                  checked={importMode === 'OVERWRITE'}
                  onChange={() => setImportMode('OVERWRITE')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Ghi đè toàn bộ</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-extrabold text-xs rounded-2xl transition shadow-md active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Chọn tệp JSON</span>
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px]">
              {selectedFileName || "Chưa chọn tệp nào"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}