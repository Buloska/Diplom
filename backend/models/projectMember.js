const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProjectMember = sequelize.define('ProjectMember', {
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('owner', 'manager', 'member'),
    allowNull: false,
    defaultValue: 'member'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 👇 Добавляем ассоциации
ProjectMember.associate = (models) => {
  ProjectMember.belongsTo(models.Project, {
    foreignKey: 'projectId'
  });


};

module.exports = ProjectMember;
