import React, { useState, useEffect } from 'react';

const BudgetAlert = () => {
  const [alertData, setAlertData] = useState({
    isExceeded: false,
    exceededBy: 0
  });

  useEffect(() => {
    const checkBudget = async () => {
      try {
        const response = await fetch('/api/budget/check');
        const result = await response.json();
        if (result.success && result.data) {
          setAlertData({
            isExceeded: result.data.isExceeded,
            exceededBy: result.data.exceededBy
          });
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra ngân sách:", error);
      }
    };

    checkBudget();
    const intervalId = setInterval(checkBudget, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {alertData.isExceeded && (
        <div className="alert-danger">
          <strong>Cảnh báo:</strong> Bạn đã vượt hạn mức chi tiêu tháng này là{' '}
          {alertData.exceededBy.toLocaleString('vi-VN')} VNĐ!
        </div>
      )}
    </>
  );
};

export default BudgetAlert;