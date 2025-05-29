import React from 'react';
import './modal.css';

const DayTaskModal = ({ tasks, date, onClose, onDelete }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Задачи на {new Date(date).toLocaleDateString()}</h3>
        {tasks.length === 0 ? <p>Нет задач</p> : (
          <ul>
            {tasks.map(task => (
              <li key={task.id}>
                <strong>{task.title}</strong><br/>
                <em>{task.description}</em><br/>
                <button onClick={() => onDelete(task.id)}>Удалить</button>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default DayTaskModal;
