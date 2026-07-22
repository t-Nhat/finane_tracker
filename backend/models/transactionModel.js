const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Thu', 'Chi'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('Transaction', transactionSchema);