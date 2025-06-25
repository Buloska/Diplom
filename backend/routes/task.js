const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkProjectRole = require('../middleware/checkProjectRole');
const taskController = require('../controllers/taskController');
const {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getTasksByProject
} = require('../controllers/taskController');
const { Task } = require('../config/db');

router.get('/', authMiddleware, getTasks);
router.get('/:id', authMiddleware, getTaskById);
router.get('/project/:projectId', authMiddleware, checkProjectRole(['owner', 'manager', 'member']), getTasksByProject);

// Только owner и manager могут создавать/редактировать задачи
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    // Если задача вне проекта — не проверяем роль
    if (!req.body.projectId) return next();
    // Иначе проверяем
    return checkProjectRole(['owner', 'manager'])(req, res, next);
  },
  addTask
);

router.put('/:id', authMiddleware, checkProjectRole(['owner', 'manager']), updateTask);

// Только owner и manager могут удалять
router.delete('/:id', authMiddleware, deleteTask);

// Задачи проекта — доступно всем участникам
router.get('/project/:projectId', authMiddleware, getTasksByProject);

// Комментарии и лейблы — опционально защищаем по желанию
router.post('/:id/comments', authMiddleware, taskController.addComment);
router.post('/:id/labels', authMiddleware, taskController.addLabel);

// Назначение исполнителя — только owner и manager
router.put('/:id/assign',
  authMiddleware,
  checkProjectRole(['owner', 'manager']),
  async (req, res) => {
    try {
      const { executorId } = req.body;
      await Task.update({ executorId }, { where: { id: req.params.id } });
      res.json({ message: 'Исполнитель назначен' });
    } catch (err) {
      res.status(500).json({ error: 'Ошибка при назначении исполнителя' });
    }
  }
);

module.exports = router;
