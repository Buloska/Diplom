
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectMember extends Model {}

  ProjectMember.init({
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: {
      type: DataTypes.ENUM('owner', 'manager', 'member'),
      allowNull: false,
      defaultValue: 'member'
    },
    joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'ProjectMember'
  });

  return ProjectMember;
};
