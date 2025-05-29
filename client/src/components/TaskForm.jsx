import React, { useState } from 'react';
import axios from 'axios';
import './TaskForm.css';

const TaskForm = ({ onSuccess, onCancel, initialDueDate = '' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [priority, setPriority] = useState('средний');
  const [status, setStatus] = useState('новая');
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      dueDate,
      priority,
      status,
      projectId: null
    };

    console.log('📤 Отправляем задачу:', payload);

    try {
      console.log('📦 payload:', JSON.stringify(payload));
      await axios.post(`${API_URL}/api/tasks`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onSuccess();
    } catch (error) {
      console.error('❌ Ошибка при создании задачи:', error);
      alert('Ошибка при создании задачи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Новая задача</h3>

      <input
        type="text"
        placeholder="Название задачи"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />

      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="низкий">Низкий</option>
        <option value="средний">Средний</option>
        <option value="высокий">Высокий</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="новая">Новая</option>
        <option value="выполнено">Выполнено</option>
      </select>

      <div className="form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать'}
        </button>
        <button type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
