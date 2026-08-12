const express = require('express');
const router = express.Router();
const BackupSnapshot = require('../models/backupSnapshotModel');

const Transaction = require('../models/transactionModel');
const Budget = require('../models/budgetModel');
const Loan = require('../models/loanModel');
const CreditDebt = require('../models/creditDebtModel');
const SavingsGoal = require('../models/savingsGoalModel');

// 1. API Lấy danh sách 30 snapshot (Chỉ lấy info nhẹ, không tải toàn bộ cục data nặng)
router.get('/', async (req, res) => {
  try {
    const list = await BackupSnapshot.find().select('-snapshotData').sort({ timestamp: -1 }).limit(30);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. API Bấm tạo Snapshot mới (Tự động xóa bản cũ nhất nếu > 30)
router.post('/', async (req, res) => {
  try {
    const { note } = req.body;
    
    // Thu thập dữ liệu hiện tại
    const [transactions, budgets, loans, creditDebts, savingsGoals] = await Promise.all([
      Transaction.find(),
      Budget.find(),
      Loan.find(),
      CreditDebt.find(),
      SavingsGoal.find()
    ]);

    // Tạo bản snapshot mới
    const newSnapshot = await BackupSnapshot.create({
      note: note || `Backup lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      snapshotData: { transactions, budgets, loans, creditDebts, savingsGoals }
    });

    // Kiểm tra giới hạn 30 bản ghi
    const totalCount = await BackupSnapshot.countDocuments();
    if (totalCount > 30) {
      // Tìm và xóa bản có thời gian cũ nhất
      await BackupSnapshot.findOneAndDelete({}, { sort: { timestamp: 1 } });
    }

    res.status(201).json({ success: true, data: newSnapshot, message: 'Tạo bản sao lưu snapshot thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. API Phục hồi dữ liệu về 1 thời điểm snapshot nhất định
router.post('/restore/:id', async (req, res) => {
  try {
    const snapshot = await BackupSnapshot.findById(req.params.id);
    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản sao lưu này!' });
    }

    const { transactions, budgets, loans, creditDebts, savingsGoals } = snapshot.snapshotData;

    // Xóa dữ liệu hiện tại và khôi phục từ snapshot
    await Promise.all([
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Loan.deleteMany({}),
      CreditDebt.deleteMany({}),
      SavingsGoal.deleteMany({})
    ]);

    if (transactions?.length) await Transaction.insertMany(transactions);
    if (budgets?.length) await Budget.insertMany(budgets);
    if (loans?.length) await Loan.insertMany(loans);
    if (creditDebts?.length) await CreditDebt.insertMany(creditDebts);
    if (savingsGoals?.length) await SavingsGoal.insertMany(savingsGoals);

    res.status(200).json({ success: true, message: `Đã khôi phục hệ thống về bản backup lúc ${new Date(snapshot.timestamp).toLocaleString('vi-VN')}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. API Xóa một snapshot
router.delete('/:id', async (req, res) => {
  try {
    await BackupSnapshot.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa bản sao lưu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;