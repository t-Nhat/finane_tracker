const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  limitAmount: { type: Number, required: true },
  month: { type: String, required: true }
});

module.exports = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);