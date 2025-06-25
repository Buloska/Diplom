const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

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

Task.belongsTo(User, { foreignKey: 'executorId', as: 'executor' });

Task.hasMany(Subtask, { foreignKey: 'taskId', onDelete: 'CASCADE' });
Subtask.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

Project.hasMany(ProjectMember, { foreignKey: 'projectId', onDelete: 'CASCADE', as: 'members' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(ProjectMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(User, { foreignKey: 'userId' });

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
