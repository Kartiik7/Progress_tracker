const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date }, // This line is crucial
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  category: { type: String },
  progress: { type: Number, default: 0 },
  target: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Task', TaskSchema);
