import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskForm from '../components/TaskForm';
import ProjectForm from '../components/ProjectForm';
import './projects.css';
import CalendarView from '../components/CalendarView';
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [globalTasks, setGlobalTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
const [showUserMenu, setShowUserMenu] = useState(false);
const [selectedDate, setSelectedDate] = useState(null); 
const toggleUserMenu = () => setShowUserMenu(prev => !prev);

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return `#${'00000'.substring(0, 6 - c.length)}${c}`;
}

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('fullName');
  navigate('/');
};
  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке проектов:', err);
    }
  }, [token]);

  const handleDeleteProject = async (projectId) => {
  if (!window.confirm('Удалить проект?')) return;
  try {
    await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProjects(); // обновить список
  } catch (err) {
    console.error('Ошибка при удалении проекта:', err);
    alert('Удаление доступно только владельцу проекта');
  }
};
  const fetchGlobalTasks = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const global = res.data.filter(task => task.projectId === null);
      setGlobalTasks(global);
    } catch (err) {
      console.error('Ошибка при загрузке задач:', err);
    }
  }, [token]);

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGlobalTasks();
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
      alert('Не удалось удалить задачу');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchGlobalTasks();
  }, [fetchProjects, fetchGlobalTasks]);

  const handleClick = (id) => {
    navigate(`/projects/${id}`);
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    fetchGlobalTasks();
  };

  const handleProjectCreated = () => {
    setShowProjectForm(false);
    fetchProjects();
  };
const fullName = localStorage.getItem('fullName') || 'П';
const initial = fullName.charAt(0).toUpperCase();
const avatarColor = stringToColor(fullName);
  return (
    <div className="projects-page">
      <div className="welcome-card">
<h1>
  Добро пожаловать, {localStorage.getItem('fullName')}!{' '}
  <span role="img" aria-label="пчела">🐝</span>
</h1>        <p>Здесь в будущем появятся ваши проекты, задачи и календарь!</p>
        <div className="user-avatar-wrapper">
  <div
  className="user-avatar"
  onClick={toggleUserMenu}
  style={{ backgroundColor: avatarColor }}
>
  {initial}
</div>
  {showUserMenu && (
    <div className="user-menu">
      <button onClick={handleLogout}>Выйти</button>
    </div>
  )}
</div>

        <div className="global-task-block">

  <div className="global-task-block">
  <h3>Мои задачи вне проектов</h3>

  <CalendarView
  tasks={globalTasks}
  onDayClick={(dateStr) => {
    setSelectedDate(dateStr);
    setShowTaskForm(true);
  }}
/>

{showTaskForm && (
  <TaskForm
    onCancel={() => {
      setShowTaskForm(false);
      setSelectedDate(null);
    }}
    onSuccess={handleTaskCreated}
    initialDueDate={selectedDate}
  />
)}
</div>
</div>
      </div>

      <div className="projects-card">
        <div className="projects-header">
          <h2>Мои проекты</h2>
          <button onClick={() => setShowProjectForm(true)}>Создать проект</button>
        </div>

        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="project-item-wrapper">
  <div
    className="project-item"
    onClick={() => handleClick(project.id)}
    style={{ cursor: 'pointer', flexGrow: 1 }}
  >
    <strong>{project.name}</strong>
    <p>Создано: {new Date(project.createdAt).toLocaleDateString()}</p>
  </div>
  {Number(localStorage.getItem('userId')) === project.ownerId && (
    <button
      className="delete-project-btn"
      onClick={(e) => {
        e.stopPropagation(); // не сработает переход по клику
        handleDeleteProject(project.id);
      }}
    >
       <span role="img" aria-label="удалить">❌</span>
    </button>
  )}
</div>
          ))
        ) : (
          <p>Проекты не найдены</p>
        )}
      </div>

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
