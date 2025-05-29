const express = require('express');
const router = express.Router();
const {getUserNotifications, markAsRead, deleteNotification, createNotification} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getUserNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.delete('/:id', authMiddleware, deleteNotification);
router.post('/', authMiddleware, createNotification);

module.exports = router;
