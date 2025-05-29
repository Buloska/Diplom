import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './projectmembersmodal.css';

const ProjectMembersModal = ({ projectId, onClose, userRole }) => {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchMembers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/project-members/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (err) {
      console.error('Ошибка при получении участников:', err);
    }
  }, [projectId, token]);

  const handleAdd = async () => {
    try {
      await axios.post(`${API_URL}/api/project-members/${projectId}`, {
        email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmail('');
      fetchMembers();
    } catch (err) {
      console.error('Ошибка при добавлении участника:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <h2>Участники проекта</h2>
        <ul>
          {members.map((m) => (
            <li
              key={m.userId}
              className="member-row"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div className="member-info">
                <div>{m.user?.fullName || 'Без имени'}</div>
                <div style={{ fontSize: '0.85em', color: '#888' }}>{m.user?.email}</div>
              </div>

              {userRole === 'owner' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={m.role}
                    onChange={async (e) => {
                      try {
                        await axios.put(`${API_URL}/api/project-members/${projectId}/${m.user.id}`, {
                          role: e.target.value
                        }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchMembers();
                      } catch (err) {
                        console.error('Ошибка при изменении роли:', err);
                      }
                    }}
                  >
                    <option value="owner">Владелец</option>
                    <option value="manager">Менеджер</option>
                    <option value="member">Участник</option>
                  </select>
                  <button
                    className="delete-user-btn"
                    onClick={async () => {
                      try {
                        await axios.delete(`${API_URL}/api/project-members/${projectId}/${m.user.id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchMembers();
                      } catch (err) {
                        console.error('Ошибка при удалении участника:', err);
                      }
                    }}
                  >
                    🗑
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {userRole === 'owner' && (
          <div className="member-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email пользователя"
            />
            <button onClick={handleAdd}>Добавить</button>
          </div>
        )}

        <button className="close-btn" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default ProjectMembersModal;
