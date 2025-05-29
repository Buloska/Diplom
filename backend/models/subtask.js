module.exports = (sequelize, DataTypes) => {
  const Subtask = sequelize.define('Subtask', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });


  Subtask.associate = (models) => {
    Subtask.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task'
    });
  };

  return Subtask;
};
