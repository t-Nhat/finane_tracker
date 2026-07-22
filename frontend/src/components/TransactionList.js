import React, { useEffect, useState } from 'react';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  // Hàm hỗ trợ lấy Token an toàn từ localStorage
  const getToken = () => {
    // Ưu tiên lấy key 'token', nếu không có thì tìm trong 'mern_finance_user'
    const token = localStorage.getItem('token');
    if (token) return token;

    const savedUser = localStorage.getItem('mern_finance_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.token || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = getToken();

      // 🟢 GỬI KÈM TOKEN TRONG HEADER
      const response = await fetch('http://localhost:5001/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🟢 ĐÍNH KÈM TOKEN Ở ĐÂY
        }
      });

      const data = await response.json();

      // BẢO VỆ CHỐNG SẬP WEB: Đảm bảo data là một mảng thì mới lưu
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Trường hợp backend trả về object { success: true, data: [...] }
        setTransactions(data.data);
      } else {
        console.error("Dữ liệu trả về không hợp lệ:", data);
        setTransactions([]); // Gán bằng mảng rỗng để không bị lỗi .map
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setTransactions([]); // Lỗi mạng cũng gán mảng rỗng
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;

    try {
      const token = getToken();

      // 🟢 GỬI KÈM TOKEN KHI XÓA
      const response = await fetch(`http://localhost:5001/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🟢 ĐÍNH KÈM TOKEN Ở ĐÂY
        }
      });

      if (response.ok) {
        fetchTransactions(); // Load lại danh sách sau khi xóa thành công
      } else {
        const errData = await response.json();
        alert(errData.message || "Không thể xóa giao dịch này.");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  return (
    <div className="transaction-list">
      {(!transactions || transactions.length === 0) ? (
        <p>Chưa có giao dịch nào. Hãy thêm mới nhé!</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Danh mục</th>
              <th>Số tiền</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.date ? new Date(transaction.date).toLocaleDateString('vi-VN') : ''}</td>
                <td style={{ color: transaction.type === 'Thu' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {transaction.type}
                </td>
                <td>{transaction.category}</td>
                <td>{transaction.amount ? transaction.amount.toLocaleString() : 0} đ</td>
                <td>{transaction.note}</td>
                <td>
                  <button onClick={() => handleDelete(transaction._id)} style={{ color: 'red', cursor: 'pointer' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionList;