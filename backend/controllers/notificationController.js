const Notification = require('../models/notification');

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({ where: { userId } });
    res.json(notifications);
  } catch (err) {
    console.error('Ошибка при получении уведомлений:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ message: 'Уведомление прочитано' });
  } catch (err) {
    console.error('Ошибка при обновлении уведомления:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }

    await notification.destroy();
    res.json({ message: 'Уведомление удалено' });
  } catch (err) {
    console.error('Ошибка при удалении уведомления:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const createNotification = async (req, res) => {
    try {
      const { message, userId } = req.body;
      const notification = await Notification.create({
        message,
        userId,
        type: 'info', // если есть поле типа
        status: 'unread', // если статус нужен
        sentAt: new Date() // если используешь дату
      });
  
      res.status(201).json(notification);
    } catch (error) {
      console.error('Ошибка при создании уведомления:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
};


module.exports = {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  createNotification
};
