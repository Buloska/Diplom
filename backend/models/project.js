
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {}

  Project.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    ownerId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'Project',
    timestamps: true
  });

  return Project;
};
