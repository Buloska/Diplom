const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// 👇 Добавляем связи — выполнять после определения моделей
Project.associate = (models) => {
  Project.hasMany(models.ProjectMember, {
    foreignKey: 'projectId',
    as: 'project_members'
  });
};

module.exports = Project;
