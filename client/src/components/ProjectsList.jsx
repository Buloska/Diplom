import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './projects.css';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const API_URL = process.env.REACT_APP_API_URL;

  const token = localStorage.getItem('token');

  // Загрузка проектов с сервера
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects`,  {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProjects(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке проектов:', err);
      }
    };
    fetchProjects();
  }, [token]);

  const handleCreate = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/projects`,
        newProject,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setProjects([...projects, response.data]);
      setNewProject({ name: '', description: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Ошибка при создании проекта:', err);
    }
  };

  return (
    <div className="projects-card">
      <div className="projects-header">
        <h1>Мои проекты</h1>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отменить' : 'Создать проект'}
        </button>
      </div>

      {showForm && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Название"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
          />
          <textarea
            placeholder="Описание"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
          <button onClick={handleCreate}>Создать</button>
        </div>
      )}

      <ul className="project-list">
        {projects.map((proj) => (
          <li key={proj.id} className="project-item">
            <h3>{proj.name}</h3>
            <p>{proj.description}</p>
            <small>Создано: {new Date(proj.createdAt).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsList;
