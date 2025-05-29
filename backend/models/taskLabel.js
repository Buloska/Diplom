const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TaskLabel = sequelize.define('TaskLabel', {
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  labelId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = TaskLabel;
