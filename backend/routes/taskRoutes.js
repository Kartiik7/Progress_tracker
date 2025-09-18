const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a task
router.post('/', authMiddleware, taskController.createTask);
// Get all tasks for user
router.get('/', authMiddleware, taskController.getTasks);
// Update a task
router.put('/:id', authMiddleware, taskController.updateTask);
// Delete a task
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;
