const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkProjectRole = require('../middleware/checkProjectRole');
const { Subtask, Task } = require('../config/db');
const { ProjectMember } = require('../config/db');
// POST /subtasks — создание
router.post(
  '/',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { taskId } = req.body;
      const task = await Task.findByPk(taskId);
      if (!task) return res.status(404).json({ message: 'Задача не найдена' });

      req.body.projectId = task.projectId; // 💡 для checkProjectRole
      next();
    } catch (err) {
      console.error('Ошибка при получении projectId из задачи:', err);
      res.status(500).json({ message: 'Ошибка при проверке projectId' });
    }
  },
  checkProjectRole(['owner', 'manager']),
  async (req, res) => {
    console.log('📩 POST /subtasks — req.body:', req.body);
    try {
      const { taskId, title } = req.body;
      const newSubtask = await Subtask.create({ taskId, title, completed: false });
      res.json(newSubtask);
    } catch (err) {
      console.error('❌ Ошибка создания подзадачи:', err);
      res.status(500).json({ error: 'Ошибка создания подзадачи' });
    }
  }
);

// PUT /subtasks/:id — обновление
router.put(
  '/:id',
  authMiddleware,
  async (req, res, next) => {
    try {
      const subtask = await Subtask.findByPk(req.params.id, {
        include: { model: Task, as: 'task', attributes: ['projectId'] }
      });

      if (!subtask || !subtask.task) {
        return res.status(404).json({ message: 'Подзадача или задача не найдена' });
      }

      req.body.projectId = subtask.task.projectId;
      req.subtask = subtask; // передаём подзадачу дальше
      next();
    } catch (err) {
      console.error('Ошибка при поиске подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при поиске подзадачи' });
    }
  },
  async (req, res) => {
    const { title, completed } = req.body;
    const { id: userId } = req.user;
    const projectId = req.body.projectId;

    try {
      // Ищем роль пользователя в проекте
      const membership = await ProjectMember.findOne({
        where: { userId, projectId }
      });

      const role = membership?.role;

      // Участник может только отмечать выполнение
      const isOnlyCompletedChange =
        typeof completed !== 'undefined' &&
        typeof title === 'undefined';

      if (
        !membership ||
        (role === 'member' && !isOnlyCompletedChange)
      ) {
        return res.status(403).json({ message: 'Недостаточно прав для изменения подзадачи' });
      }

      const updates = {};
      if (typeof title !== 'undefined') updates.title = title;
      if (typeof completed !== 'undefined') updates.completed = completed;

      const [updated] = await Subtask.update(updates, {
        where: { id: req.params.id }
      });

      if (updated === 0) {
        return res.status(404).json({ message: 'Подзадача не найдена' });
      }

      res.json({ message: 'Подзадача обновлена' });
    } catch (err) {
      console.error('Ошибка при обновлении подзадачи:', err);
      res.status(500).json({ error: 'Ошибка обновления подзадачи' });
    }
  }
);


// GET /subtasks/task/:taskId — получение
router.get('/task/:taskId', authMiddleware, checkProjectRole(['owner', 'manager', 'member']), async (req, res) => {
  try {
    const subtasks = await Subtask.findAll({
      where: { taskId: req.params.taskId },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['projectId']
        }
      ]
    });
    

    res.json(subtasks);
  } catch (err) {
    console.error('Ошибка при получении подзадач:', err);
    res.status(500).json({ error: 'Ошибка получения подзадач' });
  }
});

// DELETE /subtasks/:id — удаление подзадачи
router.delete('/:id', authMiddleware, checkProjectRole(['owner', 'manager']), async (req, res) => {
  try {
    const deleted = await Subtask.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Подзадача удалена' });
    } else {
      res.status(404).json({ error: 'Подзадача не найдена' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления подзадачи' });
  }
});

router.put('/:id/comment', authMiddleware, checkProjectRole(['manager', 'owner']), async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const subtask = await Subtask.findByPk(id);
    if (!subtask) return res.status(404).json({ message: 'Подзадача не найдена' });

    subtask.comment = comment;
    await subtask.save();
    res.json({ message: 'Комментарий обновлён' });
  } catch (err) {
    console.error('Ошибка при сохранении комментария:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
module.exports = router;
