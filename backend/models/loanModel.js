const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['LEND', 'BORROW'], required: true }, // LEND: Cho mượn, BORROW: Đang nợ
  dueDate: { type: Date },
  status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', loanSchema);