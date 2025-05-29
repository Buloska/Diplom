const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Label = sequelize.define('Label', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#cccccc'
  }
});

module.exports = Label;
