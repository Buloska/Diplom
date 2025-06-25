
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskLabel extends Model {}

  TaskLabel.init({
    taskId: { type: DataTypes.INTEGER, allowNull: false },
    labelId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'TaskLabel'
  });

  return TaskLabel;
};
