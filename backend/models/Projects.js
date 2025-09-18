const mongoose = require('mongoose');

const SubTaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['In Progress', 'Completed', 'On Hold'], default: 'In Progress' },
    subTasks: [SubTaskSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
