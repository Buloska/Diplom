import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './projectdetail.css'; // можешь подключить другой css, если нужно

const GlobalTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGlobalTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // ❗ Фильтруем только задачи без projectId (глобальные)
        const globalTasks = res.data.filter(task => task.projectId === null);
        setTasks(globalTasks);
      } catch (err) {
        console.error('Ошибка при загрузке глобальных задач:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalTasks();
  }, [token]);

  return (
    <div className="project-detail-container">
      <h2>Мои задачи вне проекта</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className="task-item">
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>Статус: {task.status}</small>
              <br />
              <small>Приоритет: {task.priority}</small>
              {task.dueDate && (
                <p>Срок: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Глобальные задачи не найдены</p>
      )}
    </div>
  );
};

export default GlobalTasks;
