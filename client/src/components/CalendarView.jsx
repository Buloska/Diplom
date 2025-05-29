import React, { useState } from 'react';
import './CalendarView.css';
import axios from 'axios';

const CalendarView = ({ tasks = [], onDayClick, onRightClick, onTaskDeleted }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [contextMenuDay, setContextMenuDay] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const getTasksForDate = (day) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    return tasks.filter(task => task.dueDate?.startsWith(dateStr));
  };

  const handleClick = (day) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    onDayClick(dateStr);
  };

  const handleRightClick = (e, day) => {
    e.preventDefault();
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    setContextMenuDay(dateStr);
    setShowContextMenu(true);
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const tasksForDay = getTasksForDate(day);
    days.push(
      <div
        key={day}
        className="calendar-cell"
        onClick={() => handleClick(day)}
        onContextMenu={(e) => handleRightClick(e, day)}
      >
        <div className="date-number">{day}</div>
        {tasksForDay.map(task => (
          <div key={task.id} className="calendar-task">
            {task.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>←</button>
        <span>{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={nextMonth}>→</button>
      </div>
      <div className="calendar-grid">
        {days}
      </div>

      {showContextMenu && contextMenuDay && (
        <div className="day-task-modal-overlay" onClick={() => setShowContextMenu(false)}>
          <div className="day-task-modal" onClick={e => e.stopPropagation()}>
            <h3>Задачи на {contextMenuDay}</h3>
            <ul>
              {tasks
                .filter(task => task.dueDate?.startsWith(contextMenuDay))
                .map(task => (
                  <li key={task.id} className="modal-task-item">
                    <strong>{task.title}</strong> — {task.description}
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`http://localhost:5000/api/tasks/${task.id}`, {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          setShowContextMenu(false);
                          if (onTaskDeleted) onTaskDeleted(); // обновление
                        } catch (err) {
                          alert('Ошибка при удалении');
                        }
                      }}
                    >
                      <span role="img" aria-label="удалить">❌</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
