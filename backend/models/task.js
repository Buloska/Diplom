
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {}

  Task.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'новая' },
    priority: { type: DataTypes.STRING, allowNull: false, defaultValue: 'средний' },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
    x: { type: DataTypes.INTEGER, defaultValue: 0 },
    y: { type: DataTypes.INTEGER, defaultValue: 0 },
    executorId: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'Task'
  });

  return Task;
};
