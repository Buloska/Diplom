const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Comment = sequelize.define('Comment', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Comment;
