const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protect = require('../middleware/authMiddleware');

// Models dùng cho Export
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Loan = require('../models/loanModel');
const CreditDebt = require('../models/creditDebtModel');
const SavingsGoal = require('../models/savingsGoalModel');

// ─── HELPER: Lấy native MongoDB collection (bypass Mongoose validation) ────────
const getCol = (name) => mongoose.connection.collection(name);

// Safe ObjectId Helper
const toObjectId = (idStr) => {
  if (!idStr) return null;
  try {
    return new mongoose.Types.ObjectId(idStr);
  } catch (e) {
    return null;
  }
};

// ─── HELPER: Chuẩn hóa dữ liệu + Gắn User ID của người đang đăng nhập ──────────
const prepareDocs = (arr, userIdObj) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.map(doc => {
    const { _id, __v, ...rest } = doc;
    
    // Gắn user ID của người dùng hiện tại để query tìm thấy được
    if (userIdObj) {
      rest.user = userIdObj;
    }

    // Chuẩn hóa Budget nếu thiếu amount hoặc limitAmount
    if (rest.limitAmount !== undefined && rest.amount === undefined) {
      rest.amount = Number(rest.limitAmount);
    }
    if (rest.amount !== undefined && rest.limitAmount === undefined) {
      rest.limitAmount = Number(rest.amount);
    }

    // Convert date string -> Date object nếu cần
    if (rest.date && typeof rest.date === 'string') {
      rest.date = new Date(rest.date);
    }
    if (rest.dueDate && typeof rest.dueDate === 'string') {
      rest.dueDate = new Date(rest.dueDate);
    }

    return rest;
  });
};

// ─── 1. EXPORT: Xuất toàn bộ dữ liệu ra JSON ──────────────────────────────────
router.get('/export', protect, async (req, res) => {
  try {
    const userIdObj = toObjectId(req.userId);
    const filter = userIdObj ? { user: userIdObj } : {};

    const [transactions, budgets, loans, creditDebts, savingsGoals] = await Promise.all([
      Transaction.find(filter).lean(),
      Budget.find(filter).lean(),
      Loan.find(filter).lean(),
      CreditDebt.find(filter).lean(),
      SavingsGoal.find(filter).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        exportDate: new Date().toISOString(),
        version: '2.0',
        data: { transactions, budgets, loans, creditDebts, savingsGoals }
      },
      message: 'Xuất dữ liệu thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 2. IMPORT: Nhập dữ liệu từ file JSON ─────────────────────────────────────
router.post('/import', protect, async (req, res) => {
  try {
    const { importData, mode } = req.body;

    if (!importData || !importData.data) {
      return res.status(400).json({
        success: false,
        message: 'Cấu trúc file JSON không hợp lệ! Hãy chọn đúng file backup do hệ thống tạo ra.'
      });
    }

    const userIdObj = toObjectId(req.userId);
    if (!userIdObj) {
      return res.status(401).json({ success: false, message: 'Tài khoản người dùng không hợp lệ!' });
    }

    const { transactions, budgets, loans, creditDebts, savingsGoals } = importData.data;

    // Collection thực tế trong MongoDB
    const transCol   = getCol('transactions');
    const budgetCol  = getCol('budgets');
    const loanCol    = getCol('loans');
    const creditCol  = getCol('creditdebts');
    const savingsCol = getCol('savingsgoals');

    // Nếu OVERWRITE: chỉ xóa dữ liệu thuộc về USER đang đăng nhập
    if (mode === 'OVERWRITE') {
      const deleteFilter = { user: userIdObj };
      await Promise.all([
        transCol.deleteMany(deleteFilter),
        budgetCol.deleteMany(deleteFilter),
        loanCol.deleteMany(deleteFilter),
        creditCol.deleteMany(deleteFilter),
        savingsCol.deleteMany(deleteFilter),
      ]);
    }

    const results = { inserted: 0, skipped: 0 };

    const safeInsert = async (col, arr) => {
      const docs = prepareDocs(arr, userIdObj);
      if (!docs.length) return;
      try {
        const result = await col.insertMany(docs, { ordered: false });
        results.inserted += result.insertedCount;
      } catch (err) {
        if (err.code === 11000 || err.writeErrors) {
          const ok = err.result?.nInserted ?? (err.insertedCount ?? 0);
          results.inserted += ok;
          results.skipped += docs.length - ok;
        } else {
          throw err;
        }
      }
    };

    await safeInsert(transCol,   transactions);
    await safeInsert(budgetCol,  budgets);
    await safeInsert(loanCol,    loans);
    await safeInsert(creditCol,  creditDebts);
    await safeInsert(savingsCol, savingsGoals);

    const modeLabel = mode === 'OVERWRITE' ? 'Ghi đè' : 'Gộp thêm';
    let msg = `Phục hồi thành công (${modeLabel})! Đã nhập ${results.inserted} bản ghi vào tài khoản của bạn.`;
    if (results.skipped > 0) msg += ` Bỏ qua ${results.skipped} bản ghi trùng lặp.`;

    res.status(200).json({ success: true, message: msg });
  } catch (error) {
    console.error('❌ Lỗi import dữ liệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;