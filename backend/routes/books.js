const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController.js');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware is applied to all routes to ensure user is authenticated
router.use(authMiddleware);

router.post('/', bookController.createBook);
router.get('/', bookController.getBooks);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;

