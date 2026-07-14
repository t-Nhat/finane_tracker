const express = require('express');
const router = express.Router();

// Nhúng các model cần thiết để đóng gói dữ liệu
const Transaction = require('../models/transactionModel');
const Budget = require('../models/budgetModel');
const Loan = require('../models/loanModel');
const CreditDebt = require('../models/creditDebtModel');
const SavingsGoal = require('../models/savingsGoalModel');

// 1. API Xuất toàn bộ dữ liệu ra JSON
router.get('/export', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const budgets = await Budget.find();
    const loans = await Loan.find();
    const creditDebts = await CreditDebt.find();
    const savingsGoals = await SavingsGoal.find();

    const exportBundle = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      data: {
        transactions,
        budgets,
        loans,
        creditDebts,
        savingsGoals
      }
    };

    res.status(200).json({
      success: true,
      data: exportBundle,
      message: 'Xuất dữ liệu thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. API Nhập dữ liệu từ file JSON (Ghi đè hoặc Hợp nhất)
router.post('/import', async (req, res) => {
  try {
    const { importData, mode } = req.body; // mode: 'OVERWRITE' | 'MERGE'
    
    if (!importData || !importData.data) {
      return res.status(400).json({ success: false, message: 'Cấu trúc file JSON không hợp lệ!' });
    }

    const { transactions, budgets, loans, creditDebts, savingsGoals } = importData.data;

    if (mode === 'OVERWRITE') {
      await Transaction.deleteMany({});
      await Budget.deleteMany({});
      await Loan.deleteMany({});
      await CreditDebt.deleteMany({});
      await SavingsGoal.deleteMany({});
    }

    if (transactions?.length) await Transaction.insertMany(transactions);
    if (budgets?.length) await Budget.insertMany(budgets);
    if (loans?.length) await Loan.insertMany(loans);
    if (creditDebts?.length) await CreditDebt.insertMany(creditDebts);
    if (savingsGoals?.length) await SavingsGoal.insertMany(savingsGoals);

    res.status(200).json({
      success: true,
      message: `Phục hồi dữ liệu thành công (${mode === 'OVERWRITE' ? 'Chế độ ghi đè' : 'Chế độ gộp'})!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;