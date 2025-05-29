import React, { useState } from 'react';
import axios from 'axios';
import './ProjectForm.css';

const ProjectForm = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', {
        name,
        description
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onCreated(); // обновить список
      onClose();   // закрыть форму
    } catch (err) {
      console.error('Ошибка при создании проекта:', err);
      alert('Не удалось создать проект');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <h3>Создание проекта</h3>
        <form onSubmit={handleSubmit} className="project-form">
          <input
            type="text"
            placeholder="Название проекта"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-buttons">
            <button type="submit">Создать</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
