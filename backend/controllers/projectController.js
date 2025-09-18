const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            userId: req.userId
        });
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all projects for a user
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a project (e.g., title, description, subtasks)
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
