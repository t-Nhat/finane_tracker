import React, { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/check');
      const json = await res.json();
      if (json.success) setAlerts(json.data);
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Tự động làm mới thông báo sau mỗi 60 giây
    const timer = setInterval(fetchAlerts, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition active:scale-95 focus:outline-none shadow-sm"
        title="Thông báo nhắc nợ"
      >
        <span className="text-lg">🔔</span>
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 max-h-[420px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span>🔔 Nhắc Nhở & Cảnh Báo</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
            </h4>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Đóng
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p className="text-2xl mb-1">🎉</p>
              <p>Tài chính an toàn! Chưa có lời nhắc gấp nào.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-left transition ${
                    item.level === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="font-bold text-xs flex items-center justify-between mb-1">
                    <span>{item.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/60">Gấp</span>
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}