const mongoose = require('mongoose');

// Define the schema for a sub-task.
// It is defined recursively, meaning a sub-task can have its own sub-tasks.
const SubTaskSchema = new mongoose.Schema();
SubTaskSchema.add({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  subTasks: [SubTaskSchema] // This allows for infinite nesting
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  dueDate: { type: Date },
  subTasks: [SubTaskSchema], // The top-level tasks for the project
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Project', ProjectSchema);

