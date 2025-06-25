
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subtask extends Model {}

  Subtask.init({
    title: { type: DataTypes.STRING, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    taskId: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'Subtask'
  });

  return Subtask;
};
