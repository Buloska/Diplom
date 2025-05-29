const sequelize = require('./sequelize');
const User = require('../models/user');
const Task = require('../models/task');
const Label = require('../models/label');
const TaskLabel = require('../models/taskLabel');
const Project = require('../models/project');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const ProjectMember = require('../models/projectMember');
const subtaskModel = require('../models/subtask');  
const Subtask = subtaskModel(sequelize, require('sequelize').DataTypes);

User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Project, { foreignKey: 'ownerId' });
Project.belongsTo(User, { foreignKey: 'ownerId' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Task.belongsToMany(Label, { through: TaskLabel, foreignKey: 'taskId' });
Label.belongsToMany(Task, { through: TaskLabel, foreignKey: 'labelId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Task.hasMany(Comment, { foreignKey: 'taskId' });
Comment.belongsTo(Task, { foreignKey: 'taskId' })
Comment.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Project.hasMany(ProjectMember, { as: 'members' });
ProjectMember.belongsTo(Project);

User.hasMany(ProjectMember);
ProjectMember.belongsTo(User);

User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId' });

Task.belongsTo(User, { foreignKey: 'executorId', as: 'executor' });

Task.hasMany(Subtask, {
  foreignKey: 'taskId',
  onDelete: 'CASCADE'
});
Subtask.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});


module.exports = {
  sequelize,
  User,
  Task,
  Project,
  Comment,
  Notification,
  ProjectMember,
  Subtask 
};

