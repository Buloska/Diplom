
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Label extends Model {}

  Label.init({
    name: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false, defaultValue: '#cccccc' }
  }, {
    sequelize,
    modelName: 'Label'
  });

  return Label;
};
