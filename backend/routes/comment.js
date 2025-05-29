const express = require('express');
const router = express.Router();
const { addComment, getCommentsByTask, deleteComment, updateComment} = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const checkProjectRole = require('../middleware/checkProjectRole');

router.post('/:taskId', authMiddleware, checkProjectRole(['owner', 'manager']), addComment);
router.get('/:taskId', authMiddleware, getCommentsByTask);
router.delete('/:id', authMiddleware, deleteComment); 
router.put('/:id', authMiddleware, updateComment);

module.exports = router;
