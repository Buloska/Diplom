const { Task, Project, ProjectMember } = require('../config/db');
const Label = require('../models/label');
const Notification = require('../models/notification');
const { Op } = require('sequelize');
const { User } = require('../config/db');
const Subtask = require('../models/subtask');


const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      userId,
      orderIndex,
      x,
      y
    } = req.body;

    // Обновляем запись
    await Task.update(
      { title, description, status, priority, dueDate, userId, orderIndex, x, y },
      { where: { id: req.params.id } }
    );

    // Получаем обновлённую задачу
    const updatedTask = await Task.findByPk(req.params.id);

    if (!updatedTask) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Ошибка при обновлении задачи:', err);
    res.status(500).json({ error: 'Ошибка обновления задачи' });
  }
};







const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  try {
    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
      console.log('❌ Задача не найдена');
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    if (task.projectId) {
      // ✅ Если задача внутри проекта — проверяем роль в проекте
      const member = await ProjectMember.findOne({
        where: { userId, projectId: task.projectId },
      });

      if (!member || !['owner', 'manager'].includes(member.role)) {
        console.log('❌ Нет прав на удаление проектной задачи');
        return res.status(403).json({ message: 'Нет прав на удаление этой задачи' });
      }
    } else {
      // ✅ Если задача глобальная — может удалить только автор
      if (task.userId !== userId) {
        console.log('❌ Нет прав на удаление глобальной задачи');
        return res.status(403).json({ message: 'Нет прав на удаление этой задачи' });
      }
    }

    await task.destroy();
    console.log('✅ Удалена задача');
    res.json({ message: 'Задача успешно удалена' });
  } catch (err) {
    console.error('❌ Ошибка при удалении задачи:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Ошибка сервера при удалении', error: err.message });
  }
};

module.exports = { deleteTask };
const getTasks = async (req, res) => {
    const userId = req.user.id;
    const { labelId, status, dueBefore, dueAfter, search } = req.query;
  
    try {
      const whereClause = { userId };
  
      if (status) {
        whereClause.status = status;
      }
  
      if (dueBefore || dueAfter) {
        whereClause.dueDate = {};
        if (dueBefore) whereClause.dueDate[Op.lte] = new Date(dueBefore);
        if (dueAfter) whereClause.dueDate[Op.gte] = new Date(dueAfter);
      }
  
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
  
      const tasks = await Task.findAll({
        where: whereClause,
        include: labelId
          ? [{
              model: Label,
              where: { id: labelId },
              through: { attributes: [] }
            }]
          : []
      });
  
      res.json(tasks);
    } catch (err) {
      console.error('Ошибка при получении задач:', err);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
};


const addTask = async (req, res) => {
  console.log('==> req.user:', req.user);
    const { title, description, status, priority, dueDate, projectId } = req.body;
  
    try {
      const newTask = await Task.create({
        title,
        description,
        status: status || 'новая',
        priority: priority || 'средний',
        dueDate,
        projectId,
        userId: req.user.id
      });
  
      // 🔔 Уведомление
      await Notification.create({
        userId: req.user.id,
        message: `Создана новая задача: ${title}`
      });
  
      res.status(201).json({ message: 'Задача создана', task: newTask });
    } catch (err) {
      console.error('Ошибка при создании задачи:', err);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
};
  
const getTaskById = async (req, res) => {
    try {
      const taskId = req.params.id;
      const userId = req.user.id;
  
      const task = await Task.findOne({
        where: {
          id: taskId,
          userId: userId
        }
      });
  
      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }
  
      res.json(task);
    } catch (err) {
      console.error('Ошибка при получении задачи:', err);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
};
  
const getTasksByProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Проверяем, состоит ли пользователь в проекте
    const membership = await ProjectMember.findOne({
      where: { userId, projectId }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Нет доступа к задачам этого проекта' });
    }

    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    res.json(tasks);
  } catch (err) {
    console.error('Ошибка при получении задач по проекту:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.create({ content, taskId, userId });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
};

const addLabel = async (req, res) => {
  try {
    const { labelId } = req.body;
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId);
    const label = await Label.findByPk(labelId);
    if (!task || !label) return res.status(404).json({ message: 'Не найдены задача или метка' });

    await task.addLabel(label); // Sequelize связь many-to-many
    res.status(200).json({ message: 'Метка добавлена к задаче' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при добавлении метки' });
  }
};

module.exports = {
    deleteTask,
    updateTask,
    getTaskById,
    getTasks,
    addTask,
    getTasksByProject,
    addComment,
    addLabel
  };
