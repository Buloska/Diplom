const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Notification = sequelize.define('Notification', {
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Notification;
