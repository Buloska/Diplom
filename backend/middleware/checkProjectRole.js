const { ProjectMember, Task, Subtask } = require('../config/db');

module.exports = (allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    let projectId = req.params.projectId || req.body?.projectId;

    try {
      // 📌 Попытка определить projectId через задачу (если передаётся :id — например, /tasks/:id)
      if (!projectId && req.params?.id) {
        const task = await Task.findByPk(req.params.id);

        if (task) {
          console.log('📌 TASK USER ID:', task.userId);

          // 🔐 Если задача вне проекта — разрешаем только автору
          if (!task.projectId) {
            if (task.userId === userId) {
              return next();
            } else {
              return res.status(403).json({ message: 'Нет прав на глобальную задачу' });
            }
          }

          projectId = task.projectId;
        }
      }

      // 📌 Если taskId приходит в теле запроса (например, при создании подзадачи)
      if (!projectId && req.body?.taskId) {
        const task = await Task.findByPk(req.body.taskId);
        if (task) projectId = task.projectId;
      }

      // 📌 Если taskId приходит в параметрах URL (например, GET /subtasks/task/:taskId)
      if (!projectId && req.params?.taskId) {
        const task = await Task.findByPk(req.params.taskId);
        if (task) projectId = task.projectId;
      }

      // 📌 Если :id — это subtaskId
      if (!projectId && req.params?.id) {
        const subtask = await Subtask.findByPk(req.params.id, {
          include: { model: Task, as: 'task' }
        });

        if (subtask?.task?.projectId) {
          projectId = subtask.task.projectId;
        } else if (subtask?.task && !subtask.task.projectId) {
          // 🔐 Подзадача вне проекта — доступ только автору задачи
          if (subtask.task.userId === userId) {
            return next();
          } else {
            return res.status(403).json({ message: 'Нет прав на подзадачу вне проекта' });
          }
        }
      }

      // 📌 Если всё ещё не удалось определить projectId — проверим глобальную задачу напрямую
      if (!projectId) {
        const taskId = req.params.id;
        if (taskId) {
          const task = await Task.findByPk(taskId);
          if (task && task.projectId === null && task.userId === userId) {
            return next();
          }
        }

        return res.status(400).json({ message: 'Невозможно определить projectId' });
      }

      // 📌 Проверка роли участника проекта
      const membership = await ProjectMember.findOne({
        where: { userId, projectId }
      });

      if (!membership) {
        return res.status(403).json({ message: 'Вы не участник проекта' });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      req.projectRole = membership.role;
      next();
    } catch (err) {
      console.error('Ошибка в checkProjectRole:', err);
      res.status(500).json({ message: 'Ошибка проверки прав доступа' });
    }
  };
};
