const Label = require('../models/label');
const Task = require('../models/task');
const TaskLabel = require('../models/taskLabel');

const createLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await Label.create({ name, color });
    res.status(201).json(label);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при создании метки' });
  }
};

const getLabels = async (req, res) => {
  try {
    const labels = await Label.findAll();
    res.json(labels);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении меток' });
  }
};

const assignLabelToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { labelId } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    await task.addLabel(labelId);
    res.json({ message: 'Метка добавлена к задаче' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при назначении метки' });
  }
};

const removeLabelFromTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { labelId } = req.body;
  
      const task = await Task.findByPk(taskId);
      if (!task) return res.status(404).json({ message: 'Задача не найдена' });
  
      await task.removeLabel(labelId);
      res.json({ message: 'Метка удалена от задачи' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Ошибка при удалении метки' });
    }
};
  

module.exports = {
  createLabel,
  getLabels,
  assignLabelToTask,
  removeLabelFromTask
};
