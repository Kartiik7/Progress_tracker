const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController.js'); // Using explicit .js
const authMiddleware = require('../middleware/authMiddleware.js'); // Using explicit .js

// Project-level routes
router.get('/', authMiddleware, projectController.getProjects);
router.post('/', authMiddleware, projectController.createProject);
router.put('/:id', authMiddleware, projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

// Nested Sub-task routes
router.post('/:id/subtasks', authMiddleware, projectController.addSubTask);
router.put('/:id/subtasks/:subtaskId', authMiddleware, projectController.updateSubTask);
router.delete('/:id/subtasks/:subtaskId', authMiddleware, projectController.deleteSubTask);

module.exports = router;

