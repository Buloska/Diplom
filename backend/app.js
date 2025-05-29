const express = require('express');
const app = express();
const cors = require('cors');
const { sequelize } = require('./config/db');
const labelRoutes = require('./routes/label');
const projectRoutes = require('./routes/project');
const commentRoutes = require('./routes/comment');
const notificationRoutes = require('./routes/notification');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const projectMemberRoutes = require('./routes/projectMember');
const subtaskRoutes = require('./routes/subtasks');


require('dotenv').config();



app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/project-members', projectMemberRoutes);
app.use('/subtasks', subtaskRoutes);




sequelize.sync().then(() => {
  console.log('База данных синхронизирована');
});

sequelize.sync();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
