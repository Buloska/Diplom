const express = require('express');
const router = express.Router();
const { createLabel, getLabels, assignLabelToTask, removeLabelFromTask } = require('../controllers/labelController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createLabel);
router.get('/', authMiddleware, getLabels);
router.post('/assign/:taskId', authMiddleware, assignLabelToTask);
router.delete('/assign/:taskId', authMiddleware, removeLabelFromTask);

module.exports = router;
