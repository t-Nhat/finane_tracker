const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' }
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);