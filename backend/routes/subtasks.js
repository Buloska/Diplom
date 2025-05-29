const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkProjectRole = require('../middleware/checkProjectRole');
const { Subtask, Task } = require('../config/db');

// POST /subtasks — создание
router.post('/', authMiddleware, checkProjectRole(['owner', 'manager']), async (req, res) => {
  console.log('===> body:', req.body);
  try {
    const { taskId, title } = req.body;
    const newSubtask = await Subtask.create({ taskId, title, completed: false });
    res.json(newSubtask);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания подзадачи' });
  }
});
console.log('===> Subtask routes подключены');

// PUT /subtasks/:id — обновление
router.put(
  '/:id',
  authMiddleware,
  async (req, res, next) => {
    try {
      // Находим подзадачу и связанный Task
      const subtask = await Subtask.findByPk(req.params.id, {
        include: {
  model: Task,
  as: 'task',
  attributes: ['projectId']
}
      });

      if (!subtask || !subtask.Task) {
        return res.status(404).json({ message: 'Подзадача или задача не найдена' });
      }

      // Передаём projectId в body для checkProjectRole
      req.body.projectId = subtask.Task.projectId;

      next();
    } catch (err) {
      console.error('Ошибка при поиске подзадачи или задачи:', err);
      res.status(500).json({ error: 'Ошибка при проверке projectId' });
    }
  },
  checkProjectRole(['owner', 'manager']),
  async (req, res) => {
    console.log('===> PUT /subtasks/:id — req.body:', req.body);

    try {
      const updates = {};
      if (typeof req.body.title !== 'undefined') {
        updates.title = req.body.title;
      }

      if (typeof req.body.completed !== 'undefined') {
        updates.completed = req.body.completed;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
      }

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
