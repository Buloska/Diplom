import React, { useState } from 'react';
import './EditDueDateModal.css';

const EditDueDateModal = ({ task, onClose, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(task?.dueDate?.slice(0, 10) || '');

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ dueDate: selectedDate })
      });

      if (res.ok) {
        await onSave(selectedDate);
        onClose();
      } else {
        alert('Ошибка при обновлении даты');
      }
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="edit-date-modal">
        <h3>Изменить дату окончания</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleSave} className="btn save">Сохранить</button>
          <button onClick={onClose} className="btn cancel">Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default EditDueDateModal;
