const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  // Optional categorization to support dashboard widgets (e.g., 'coding', 'reading', 'milestone')
  category: { type: String },
  // Optional progress tracking for goals (e.g., pages read, minutes coded)
  progress: { type: Number, default: 0 },
  target: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Task', TaskSchema);