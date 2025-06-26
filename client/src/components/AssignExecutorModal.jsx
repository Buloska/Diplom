import React, { useEffect, useState } from 'react';
import './modal.css';

const AssignExecutorModal = ({ projectId, taskId, onClose, onAssigned }) => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;
  
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/project-members/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Ошибка загрузки участников:', err);
    }
  };
  fetchUsers();
}, [projectId, token]);

const handleAssign = async () => {
  try {
    await fetch(`${API_URL}/api/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ executorId: selectedId })
    });
    onAssigned();
    onClose();
  } catch (err) {
    console.error('Ошибка назначения исполнителя:', err);
  }
};

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <h3>Назначить исполнителя</h3>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Выберите участника</option>
          {users.map((u) => (
  <option key={u.User.id} value={u.User.id}>
    {u.User.fullName || u.User.email}
  </option>
))}
        </select>
        <div className="modal-actions">
          <button onClick={handleAssign} disabled={!selectedId}>Сохранить</button>
          <button onClick={onClose} className="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default AssignExecutorModal;
