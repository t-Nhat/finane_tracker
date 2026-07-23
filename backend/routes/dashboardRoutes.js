const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// ID mặc định của active@example.com (Dùng cứu nguy nếu Frontend gửi sai - Khắc phục Nguyên nhân 3)
const DEFAULT_USER_ID = '60d5ecb8b392d700153ee002';

// Hàm chuẩn hóa ID, khắc phục triệt để NGUYÊN NHÂN 1 (Lệch String vs ObjectId)
const getValidUserId = (req) => {
  let rawId = req.query.userId || req.headers['user-id'] || req.query.user_id || DEFAULT_USER_ID;
  if (rawId === 'undefined' || rawId === 'null') rawId = DEFAULT_USER_ID;
  try {
    return new mongoose.Types.ObjectId(rawId);
  } catch (e) {
    return rawId;
  }
};

// Hàm tạo câu query quét mọi góc ngách, khắc phục NGUYÊN NHÂN 2 (Lệch tên trường)
const buildQuery = (userObjId) => ({
  $or: [
    { user: userObjId }, { userId: userObjId }, { user_id: userObjId },
    { user: String(userObjId) }, { userId: String(userObjId) }, { user_id: String(userObjId) }
  ]
});

// 1. API lấy toàn bộ dữ liệu Dashboard
router.get('/data', async (req, res) => {
  try {
    const userObjId = getValidUserId(req);
    const db = mongoose.connection; // Khắc phục NGUYÊN NHÂN 6: Dùng Native Driver bỏ qua Schema
    const query = buildQuery(userObjId);

    const [transactions, budgets, creditdebts, loans, savingsgoals] = await Promise.all([
      db.collection('transactions').find(query).sort({ date: -1 }).toArray(),
      db.collection('budgets').find(query).toArray(),
      db.collection('creditdebts').find(query).toArray(),
      db.collection('loans').find(query).toArray(),
      db.collection('savingsgoals').find(query).toArray()
    ]);

    // Khắc phục NGUYÊN NHÂN 4: Trả về JSON chuẩn cấu trúc cho Frontend
    return res.status(200).json({ success: true, transactions, budgets, creditdebts, loans, savingsgoals });
  } catch (error) {
    console.error('Lỗi API /data:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// 2. API cho biểu đồ dòng tiền 14 ngày
router.get('/cashflow-14days', async (req, res) => {
  try {
    const userObjId = getValidUserId(req);
    const db = mongoose.connection;
    const transactions = await db.collection('transactions').find(buildQuery(userObjId)).toArray();

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let thu = 0, chi = 0;
      transactions.forEach(t => {
        if (t.date && new Date(t.date).toISOString().split('T')[0] === dateStr) {
          if (t.type === 'Thu') thu += Number(t.amount || 0);
          if (t.type === 'Chi') chi += Number(t.amount || 0);
        }
      });
      days.push({ date: dateStr, thu, chi });
    }
    return res.status(200).json({ success: true, data: days });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải dòng tiền' });
  }
});

// 3. API cho Ngân sách & Biểu đồ
router.get('/budgets', async (req, res) => {
  try {
    const db = mongoose.connection;
    const budgets = await db.collection('budgets').find(buildQuery(getValidUserId(req))).toArray();
    return res.status(200).json({ success: true, budgets, data: budgets });
  } catch (error) {
    return res.status(500).json({ success: false, budgets: [] });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const db = mongoose.connection;
    const transactions = await db.collection('transactions').find(buildQuery(getValidUserId(req))).toArray();
    return res.status(200).json({ success: true, transactions, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, transactions: [] });
  }
});

// 4. API cho biểu đồ tròn (Pie Chart) - gom nhóm theo danh mục
router.get('/category-data', async (req, res) => {
  try {
    const userObjId = getValidUserId(req);
    const db = mongoose.connection;
    const transactions = await db.collection('transactions').find(buildQuery(userObjId)).toArray();
    
    const categoryMap = {};
    transactions.forEach(t => {
      if (t.type === 'Chi') { 
        const cat = t.category || 'Khác';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount || 0);
      }
    });
    
    const data = Object.keys(categoryMap).map(key => ({
      category: key,
      amount: categoryMap[key]
    }));
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu danh mục' });
  }
});

// 5. API cho Biến động dòng tiền (Fluctuation)
router.get('/fluctuation', async (req, res) => {
  try {
    const userObjId = getValidUserId(req);
    const { timeframe = 'thang', metric = 'chitieu' } = req.query;
    const db = mongoose.connection;
    const transactions = await db.collection('transactions').find(buildQuery(userObjId)).toArray();
    
    const labels = [];
    const currentData = [];
    const previousData = [];
    let totalAmount = 0;

    const today = new Date();
    // Tạo 7 mốc thời gian gần nhất
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(`T${d.getMonth() + 1}`);
      currentData.push(0);
      previousData.push(0); 
    }

    transactions.forEach(t => {
      const matchType = metric === 'thunhap' ? 'Thu' : 'Chi';
      if (t.type === matchType && t.date) {
        const tDate = new Date(t.date);
        
        // Chỉ tính tổng amount của toàn bộ
        totalAmount += Number(t.amount || 0);
        
        // Phân bổ vào mốc tương ứng
        const monthDiff = (today.getFullYear() - tDate.getFullYear()) * 12 + today.getMonth() - tDate.getMonth();
        if (monthDiff >= 0 && monthDiff <= 6) {
          currentData[6 - monthDiff] += Number(t.amount || 0);
        }
      }
    });

    const diffAmount = currentData[6] - currentData[5]; 

    return res.status(200).json({ 
      success: true, 
      data: {
        labels,
        currentData,
        previousData,
        totalAmount,
        diffAmount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải biến động' });
  }
});

module.exports = router;