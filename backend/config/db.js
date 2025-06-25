const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('название_бд', 'логин', 'пароль', {
  host: 'localhost',
  dialect: 'mysql', // Или 'postgres', если у тебя Postgres
});

// Импорт моделей как функций
const User = require('../models/user')(sequelize, DataTypes);
const Task = require('../models/task')(sequelize, DataTypes);
const Label = require('../models/label')(sequelize, DataTypes);
const TaskLabel = require('../models/taskLabel')(sequelize, DataTypes);
const Project = require('../models/project')(sequelize, DataTypes);
const Comment = require('../models/comment')(sequelize, DataTypes);
const Notification = require('../models/notification')(sequelize, DataTypes);
const ProjectMember = require('../models/projectMember')(sequelize, DataTypes);
const Subtask = require('../models/subtask')(sequelize, DataTypes);

// Ассоциации:
User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Project, { foreignKey: 'ownerId' });
Project.belongsTo(User, { foreignKey: 'ownerId' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Task.belongsToMany(Label, { through: TaskLabel, foreignKey: 'taskId' });
Label.belongsToMany(Task, { through: TaskLabel, foreignKey: 'labelId' });

Task.hasMany(Subtask, { foreignKey: 'taskId', onDelete: 'CASCADE' });
Subtask.belongsTo(Task, { foreignKey: 'taskId' });

Project.hasMany(ProjectMember, { foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(ProjectMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(User, { foreignKey: 'userId' });

// Экспорт всех моделей и sequelize
module.exports = {
  sequelize,
  Sequelize,
  User,
  Task,
  Label,
  TaskLabel,
  Project,
  Comment,
  Notification,
  ProjectMember,
  Subtask,
};
