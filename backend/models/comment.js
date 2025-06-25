
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {}

  Comment.init({
    text: { type: DataTypes.TEXT, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    taskId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'Comment',
    timestamps: true
  });

  return Comment;
};
