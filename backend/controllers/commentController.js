const Comment = require('../models/comment');
const Task = require('../models/task');
const Notification = require('../models/notification');

const addComment = async (req, res) => {
    try {
      const { text } = req.body;
      const taskId = req.params.taskId;
      const userId = req.user.id;
  
      const task = await Task.findByPk(taskId);
      if (!task) return res.status(404).json({ message: 'Задача не найдена' });
  
      const comment = await Comment.create({ text, taskId, userId });
  
      await Notification.create({
        userId,
        message: `Добавлен комментарий к задаче "${task.title}"`
      });
  
      res.status(201).json({ message: 'Комментарий добавлен', comment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Ошибка при добавлении комментария' });
    }
};
  

const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.findAll({ where: { taskId } });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении комментариев' });
  }
};

const deleteComment = async (req, res) => {
    try {
      const commentId = req.params.id;
      const comment = await Comment.findByPk(commentId);
  
      if (!comment) {
        return res.status(404).json({ message: 'Комментарий не найден' });
      }
  
      await comment.destroy();
      res.json({ message: 'Комментарий удалён' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Ошибка при удалении комментария' });
    }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    comment.text = text || comment.text;
    await comment.save();

    res.json({ message: 'Комментарий обновлён', comment });
  } catch (err) {
    console.error('Ошибка при обновлении комментария:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  addComment,
  getCommentsByTask,
  deleteComment,
  updateComment
};
