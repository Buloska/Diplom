const { ProjectMember, Task, Subtask } = require('../config/db');

module.exports = (allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    let projectId = req.params.projectId || req.body?.projectId;

    try {
      // 📌 Попытка определить projectId через taskId (если есть :id — например при PUT /tasks/:id)
      if (!projectId && req.params?.id) {
        const task = await Task.findByPk(req.params.id);

        if (task) {
          console.log('📌 Найдена задача ID:', task.id, 'projectId:', task.projectId);

          // ✅ Если задача глобальная (projectId == null)
          if (task.projectId === null) {
            if (task.userId === userId) {
              console.log('✅ Пользователь автор глобальной задачи, доступ разрешён');
              return next();
            } else {
              console.log('❌ Нет прав на глобальную задачу');
              return res.status(403).json({ message: 'Нет прав на глобальную задачу' });
            }
          }

          projectId = task.projectId;
        }
      }

      // 📌 Если projectId определяется через taskId в теле (например, при создании подзадачи)
      if (!projectId && req.body?.taskId) {
        const task = await Task.findByPk(req.body.taskId);
        if (task) projectId = task.projectId;
      }

      // 📌 Если :taskId в URL (например GET /subtasks/task/:taskId)
      if (!projectId && req.params?.taskId) {
        const task = await Task.findByPk(req.params.taskId);
        if (task) projectId = task.projectId;
      }

      // 📌 Если :id — это subtaskId (например PUT /subtasks/:id)
      if (!projectId && req.params?.id) {
        const subtask = await Subtask.findByPk(req.params.id, {
          include: { model: Task, as: 'task' }
        });

        if (subtask?.task?.projectId) {
          projectId = subtask.task.projectId;
        } else if (subtask?.task && !subtask.task.projectId) {
          // ✅ Если подзадача глобальной задачи
          if (subtask.task.userId === userId) {
            console.log('✅ Автор подзадачи вне проекта, доступ разрешён');
            return next();
          } else {
            console.log('❌ Нет прав на подзадачу вне проекта');
            return res.status(403).json({ message: 'Нет прав на подзадачу вне проекта' });
          }
        }
      }

      // 📌 Если всё ещё нет projectId — проверяем глобальную задачу ещё раз
      if (!projectId && req.params?.id) {
        const task = await Task.findByPk(req.params.id);
        if (task && task.projectId === null && task.userId === userId) {
          console.log('✅ Повторная проверка: автор глобальной задачи, доступ разрешён');
          return next();
        }
      }

      // 📌 Если projectId так и не определён
      if (!projectId) {
        console.log('❌ Не удалось определить projectId');
        return res.status(400).json({ message: 'Не удалось определить projectId' });
      }

      // 📌 Проверка участника проекта
      const membership = await ProjectMember.findOne({
        where: { userId, projectId }
      });

      if (!membership) {
        console.log('❌ Пользователь не участник проекта');
        return res.status(403).json({ message: 'Вы не участник проекта' });
      }

      console.log('✅ Роль пользователя:', membership.role);

      if (!allowedRoles.includes(membership.role)) {
        console.log(`❌ Недостаточно прав (роль: ${membership.role}, нужно: ${allowedRoles.join(', ')})`);
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      console.log('✅ Проверка пройдена');
      next();
    } catch (err) {
      console.error('❌ Ошибка в checkProjectRole:', err);
      res.status(500).json({ message: 'Ошибка проверки доступа', error: err.message });
    }
  };
};
