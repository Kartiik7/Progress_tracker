const Project = require('../models/Projects');

// --- Project Level CRUD ---

exports.getProjects = async (req, res) => {
    try {
        const query = { userId: req.userId };
        if (req.query.startDate && req.query.endDate) {
            query.dueDate = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
        }
        const projects = await Project.find(query);
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const project = new Project({ ...req.body, userId: req.userId, subTasks: [] });
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        // Exclude subTasks from top-level updates to prevent accidental wiping
        const { subTasks, ...updateData } = req.body;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updateData,
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// --- Nested Sub-task CRUD ---

// Recursive function to find a sub-task by its ID
const findSubTask = (subTasks, subTaskId) => {
    for (const task of subTasks) {
        if (task._id.equals(subTaskId)) {
            return task;
        }
        const found = findSubTask(task.subTasks || [], subTaskId);
        if (found) return found;
    }
    return null;
};

// Add a sub-task to a project or another sub-task
exports.addSubTask = async (req, res) => {
    try {
        const { text, parentId } = req.body; // parentId can be null for root tasks
        const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newSubTask = { text, completed: false, subTasks: [] };

        if (parentId) {
            const parentTask = findSubTask(project.subTasks, parentId);
            if (!parentTask) return res.status(404).json({ message: 'Parent task not found' });
            parentTask.subTasks.push(newSubTask);
        } else {
            project.subTasks.push(newSubTask);
        }

        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a sub-task's text or completed status
exports.updateSubTask = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { text, completed } = req.body;
        
        const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const subTask = findSubTask(project.subTasks, subtaskId);
        if (!subTask) return res.status(404).json({ message: 'Sub-task not found' });

        if (text !== undefined) subTask.text = text;
        if (completed !== undefined) subTask.completed = completed;
        
        // If a parent task is completed, mark all its children completed as well
        if (completed === true) {
            const markAllChildren = (task) => {
                (task.subTasks || []).forEach(child => {
                    child.completed = true;
                    markAllChildren(child);
                });
            };
            markAllChildren(subTask);
        }


        await project.save();
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Recursive function to find and remove a sub-task
const findAndRemoveSubTask = (subTasks, subTaskId) => {
    for (let i = 0; i < subTasks.length; i++) {
        if (subTasks[i]._id.equals(subTaskId)) {
            subTasks.splice(i, 1);
            return true; // Found and removed
        }
        if (findAndRemoveSubTask(subTasks[i].subTasks || [], subTaskId)) {
            return true;
        }
    }
    return false; // Not found in this branch
};

// Delete a sub-task
exports.deleteSubTask = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const wasRemoved = findAndRemoveSubTask(project.subTasks, subtaskId);
        if (!wasRemoved) return res.status(404).json({ message: 'Sub-task not found' });

        await project.save();
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

