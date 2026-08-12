const mongoose = require('mongoose');

const creditDebtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  type: { type: String, enum: ['CREDIT_CARD', 'BANK_LOAN', 'INSTALLMENT'], required: true },
  limitAmount: { type: Number, default: 0 },
  currentDebt: { type: Number, required: true, default: 0 },
  dueDateDay: { type: Number },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CreditDebt', creditDebtSchema);