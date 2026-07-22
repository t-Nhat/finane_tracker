import React, { useState, useEffect } from 'react';

export default function NetWorthSummary() {
  const [data, setData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchNetWorth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/net-worth');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Lỗi tải tổng tài sản:', err);
    }
  };

  useEffect(() => {
    fetchNetWorth();
  }, []);

  if (!data) {
    return (
      <div className="animate-pulse flex justify-between items-center py-2">
        <div className="h-8 bg-white/20 rounded w-48"></div>
        <div className="h-8 bg-white/20 rounded w-24"></div>
      </div>
    );
  }

  const isPositive = data.netWorth >= 0;

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase bg-black/20 text-emerald-200 px-2.5 py-1 rounded-full">
              Sức Khỏe Tài Chính
            </span>
            <span className="text-xs text-white/80 font-medium">Cập nhật thời gian thực</span>
          </div>
          
          <h2 className={`text-3xl md:text-4xl font-mono font-extrabold mt-2 tracking-tight ${isPositive ? 'text-white' : 'text-rose-200'}`}>
            {data.netWorth.toLocaleString('vi-VN')} đ
          </h2>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl transition text-xs border border-white/20 self-start md:self-center shadow-sm"
        >
          {showDetails ? '🙈 Ẩn chi tiết công thức' : '🔍 Phân rã dòng tiền'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* CỘT TÀI SẢN DƯƠNG */}
          <div className="space-y-2.5 bg-black/15 p-4 rounded-xl border border-white/10">
            <p className="font-bold text-emerald-300 text-sm flex items-center justify-between">
              <span>➕ PHẦN TÀI SẢN (+)</span>
              <span className="font-mono">
                {(data.breakdown.cashBalance + data.breakdown.totalLend + data.breakdown.totalSavings).toLocaleString('vi-VN')} đ
              </span>
            </p>
            <div className="flex justify-between text-white/90">
              <span>Ví & Tài khoản ngân hàng:</span>
              <span className="font-mono font-semibold">{data.breakdown.cashBalance.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Tiền cho người khác mượn:</span>
              <span className="font-mono font-semibold">{data.breakdown.totalLend.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Tiền trong heo tiết kiệm:</span>
              <span className="font-mono font-semibold">{data.breakdown.totalSavings.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* CỘT NỢ PHẢI TRẢ */}
          <div className="space-y-2.5 bg-black/15 p-4 rounded-xl border border-white/10">
            <p className="font-bold text-rose-300 text-sm flex items-center justify-between">
              <span>➖ PHẦN NỢ PHẢI TRẢ (-)</span>
              <span className="font-mono">
                {(data.breakdown.totalBorrow + data.breakdown.totalOrgDebt).toLocaleString('vi-VN')} đ
              </span>
            </p>
            <div className="flex justify-between text-white/90">
              <span>Tiền đang nợ cá nhân:</span>
              <span className="font-mono font-semibold">{data.breakdown.totalBorrow.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Dư nợ Thẻ & Vay tổ chức:</span>
              <span className="font-mono font-semibold">{data.breakdown.totalOrgDebt.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}