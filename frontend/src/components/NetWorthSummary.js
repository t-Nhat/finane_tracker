import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Wallet, PiggyBank, CreditCard, Eye, EyeOff, PlusCircle, MinusCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api/dashboard/net-worth';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  const savedUser = localStorage.getItem('mern_finance_user');
  if (savedUser) {
    try { return JSON.parse(savedUser).token; } catch (e) { return null; }
  }
  return null;
};

export default function NetWorthSummary() {
  const [data, setData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNetWorth = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(API_BASE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Lỗi tải tổng tài sản ròng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetWorth();
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-3xl text-white animate-pulse shadow-md">
        <div className="h-6 bg-white/20 rounded-xl w-48 mb-3"></div>
        <div className="h-10 bg-white/30 rounded-2xl w-64"></div>
      </div>
    );
  }

  const netWorth = data.netWorth || 0;
  const isPositive = netWorth >= 0;
  const breakdown = data.breakdown || { cashBalance: 0, totalLend: 0, totalSavings: 0, totalBorrow: 0, totalOrgDebt: 0 };
  const totalAssets = (breakdown.cashBalance || 0) + (breakdown.totalLend || 0) + (breakdown.totalSavings || 0);
  const totalLiabilities = breakdown.totalBorrow || 0; // Đã loại bỏ totalOrgDebt khỏi Tổng Nợ Phải Trả

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-500/30 relative overflow-hidden">
      {/* GLOW DECORATIONS */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider uppercase bg-black/30 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-400/30 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4" />
              TỔNG TÀI SẢN
            </span>
          </div>

          <h2 className={`text-3xl sm:text-4xl font-mono font-extrabold mt-3 tracking-tight ${isPositive ? 'text-white' : 'text-rose-300'}`}>
            {netWorth.toLocaleString('vi-VN')} đ
          </h2>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold px-5 py-3 rounded-2xl transition text-xs border border-white/20 self-start md:self-center shadow-lg backdrop-blur-md"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showDetails ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết'}</span>
        </button>
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs relative z-10 animate-fadeIn">
          {/* CỘT TÀI SẢN DƯƠNG */}
          <div className="space-y-3 bg-black/25 p-5 rounded-2xl border border-emerald-400/20 backdrop-blur-md">
            <p className="font-extrabold text-emerald-300 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                TỔNG TÀI SẢN (+)
              </span>
              <span className="font-mono text-base">{totalAssets.toLocaleString('vi-VN')} đ</span>
            </p>
            <div className="flex justify-between items-center text-white/90 pt-1 border-t border-white/10">
              <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-300" /> Ví & Ngân hàng:</span>
              <span className="font-mono font-bold">{(breakdown.cashBalance || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-300" /> Tiền cho mượn:</span>
              <span className="font-mono font-bold">{(breakdown.totalLend || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1.5"><PiggyBank className="w-3.5 h-3.5 text-emerald-300" /> Heo tiết kiệm:</span>
              <span className="font-mono font-bold">{(breakdown.totalSavings || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* CỘT NỢ PHẢI TRẢ */}
          <div className="space-y-3 bg-black/25 p-5 rounded-2xl border border-rose-400/20 backdrop-blur-md">
            <p className="font-extrabold text-rose-300 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4 text-rose-400" />
                TỔNG NỢ PHẢI TRẢ (-)
              </span>
              <span className="font-mono text-base">{totalLiabilities.toLocaleString('vi-VN')} đ</span>
            </p>
            <div className="flex justify-between items-center text-white/90 pt-1 border-t border-white/10">
              <span>Nợ cá nhân mượn:</span>
              <span className="font-mono font-bold">{(breakdown.totalBorrow || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center text-white/70 mt-3 pt-3 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-xs"><CreditCard className="w-3.5 h-3.5 opacity-70" /> Dư nợ Thẻ/Vay (Ghi nhớ):</span>
              <span className="font-mono font-bold">{(breakdown.totalOrgDebt || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}