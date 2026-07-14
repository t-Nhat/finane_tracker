const mongoose = require('mongoose');

const backupSnapshotSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  note: { type: String, required: true, default: 'Sao lưu thủ công' },
  snapshotData: {
    transactions: { type: Array, default: [] },
    budgets: { type: Array, default: [] },
    loans: { type: Array, default: [] },
    creditDebts: { type: Array, default: [] },
    savingsGoals: { type: Array, default: [] }
  }
});

module.exports = mongoose.model('BackupSnapshot', backupSnapshotSchema);