const { ProjectMember, Task, Subtask } = require('../config/db');

module.exports = (allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    let projectId = req.params.projectId || req.body?.projectId;

    try {
      // 📌 Если projectId нет — пытаемся определить его по taskId (при :id в URL)
      if (!projectId && req.params?.id) {
        const task = await Task.findByPk(req.params.id);

        if (task) {
          console.log('📌 TASK USER ID:', task.userId);

          // 🔐 Если глобальная задача (без projectId)
          if (!task.projectId) {
            if (task.userId === userId) {
              console.log('✅ Пользователь — автор глобальной задачи, доступ разрешён');
              return next();
            } else {
              console.log('❌ Нет прав на глобальную задачу');
              return res.status(403).json({ message: 'Нет прав на глобальную задачу' });
            }
          }

          projectId = task.projectId;
        }
      }

      // 📌 Если taskId в теле (например, при создании подзадачи)
      if (!projectId && req.body?.taskId) {
        const task = await Task.findByPk(req.body.taskId);
        if (task) projectId = task.projectId;
      }

      // 📌 Если taskId в параметрах (например GET /subtasks/task/:taskId)
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
          // 🔐 Если подзадача вне проекта — доступ только автору
          if (subtask.task.userId === userId) {
            console.log('✅ Автор подзадачи вне проекта, доступ разрешён');
            return next();
          } else {
            console.log('❌ Нет прав на подзадачу вне проекта');
            return res.status(403).json({ message: 'Нет прав на подзадачу вне проекта' });
          }
        }
      }

      // 📌 Если всё ещё нет projectId — проверяем ещё раз глобальную задачу
      if (!projectId && req.params?.id) {
        const task = await Task.findByPk(req.params.id);
        if (task && task.projectId === null && task.userId === userId) {
          console.log('✅ Повторная проверка: автор глобальной задачи, доступ разрешён');
          return next();
        }
      }

      // 📌 Если всё ещё нет projectId — ошибка
      if (!projectId) {
        console.log('❌ Не удалось определить projectId');
        return res.status(400).json({ message: 'Не удалось определить projectId' });
      }

      // 📌 Проверка роли участника проекта
      const membership = await ProjectMember.findOne({
        where: { userId, projectId }
      });

      if (!membership) {
        console.log('❌ Пользователь не участник проекта');
        return res.status(403).json({ message: 'Вы не участник проекта' });
      }

      if (!allowedRoles.includes(membership.role)) {
        console.log(`❌ Недостаточно прав (роль: ${membership.role}, нужно: ${allowedRoles.join(', ')})`);
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      console.log('✅ Проверка пройдена. Роль пользователя:', membership.role);
      req.projectRole = membership.role;
      next();
    } catch (err) {
      console.error('❌ Ошибка в checkProjectRole:', err);
      res.status(500).json({ message: 'Ошибка при проверке прав доступа', error: err.message });
    }
  };
};
