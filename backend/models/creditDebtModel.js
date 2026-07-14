const mongoose = require('mongoose');

const creditDebtSchema = new mongoose.Schema({
  name: { type: String, required: true }, // VD: Thẻ Techcombank, Vay mua xe
  type: { type: String, enum: ['CREDIT_CARD', 'BANK_LOAN', 'INSTALLMENT'], required: true },
  limitAmount: { type: Number, default: 0 }, // Hạn mức thẻ (nếu là thẻ tín dụng)
  currentDebt: { type: Number, required: true, default: 0 }, // Dư nợ hiện tại
  dueDateDay: { type: Number }, // Ngày chốt/trả nợ hàng tháng (1-31)
  note: { type: String }
});

module.exports = mongoose.model('CreditDebt', creditDebtSchema);