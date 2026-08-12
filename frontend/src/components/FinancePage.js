import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

function FinancePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    // Tăng key để ép TransactionList mount lại và gọi lại API fetch
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          Quản Lý Chi Tiêu Cá Nhân 💰
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái: Form thêm giao dịch */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-md font-bold mb-4 text-emerald-600 dark:text-emerald-400">
            Thêm Giao Dịch Mới
          </h2>
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
        </div>
        
        {/* Cột Phải: Bảng danh sách giao dịch */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-md font-bold mb-4 text-slate-700 dark:text-slate-200">
            Lịch Sử Giao Dịch
          </h2>
          <TransactionList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}

export default FinancePage;