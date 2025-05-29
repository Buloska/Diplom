// Обновлённый projectdetail.jsx с разграничением прав и useCallback для fetchRole
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './projectdetail.css';
import ProjectMembersModal from '../components/ProjectMembersModal';
import AssignExecutorModal from '../components/AssignExecutorModal';
import EditDueDateModal from '../components/EditDueDateModal';
import CommentModal from '../components/CommentModal';


const ContextMenu = ({ x, y, options, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <ul className="context-menu" ref={menuRef} style={{ top: y, left: x }}>
      {options.map((opt, idx) => (
        <li key={idx} onClick={opt.onClick}>{opt.label}</li>
      ))}
    </ul>
  );
};
const SortableTask = ({ task, onAddSubtask, onToggleSubtask, onRename, onRenameSubtask }) => {
  // 🔒 Защита от повреждённых задач
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const [editing, setEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(task.title);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subtaskTempTitle, setSubtaskTempTitle] = useState('');

  if (!task || !task.id || typeof task.title !== 'string') {
    console.warn('⛔ Пропуск задачи с некорректными данными:', task);
    return null;
  }
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: task.subtasks?.length > 0 && task.subtasks.every(st => st.completed) ? '2px solid green' : 'none',
    position: 'absolute',
    left: task.x || 0,
    top: task.y || 0,
  };

  const handleRename = () => {
    if (tempTitle.trim() !== '') {
      onRename(task.id, tempTitle);
      setEditing(false);
    }
  };

  const handleSubtaskRename = (subtaskId) => {
    if (subtaskTempTitle.trim() !== '') {
      onRenameSubtask(subtaskId, subtaskTempTitle);
      setEditingSubId(null);
      setSubtaskTempTitle('');
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="task-card"
      style={style}
      data-id={task.id}
    >
      <div className="task-content">
        <div className="task-priority">{task.priority}</div>
        <button className="task-card-add" onClick={() => onAddSubtask(task.id)}>+</button>

        {editing ? (
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
        ) : (
          <h3 onClick={() => setEditing(true)}>{task.title}</h3>
        )}

        {task.executor && (
          <div className="task-executor">
            <span role="img" aria-label="исполнитель">👤</span>{' '}
            {task.executor.fullName || task.executor.email}
          </div>
        )}

        <ul className="subtasks-list">
          {task.subtasks?.map((subtask) => (
            <li
  key={subtask.id}
  className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
  data-id={subtask.id}                      // ID подзадачи
  data-task-id={task.id}                   // (опционально, если пригодится для меню)
>
              <span
                className={`checkbox ${subtask.completed ? 'checked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubtask(task.id, task.subtasks.indexOf(subtask));
                }}
              >
                {subtask.completed ? '✓' : ''}
              </span>

              {editingSubId === subtask.id ? (
                <input
                  type="text"
                  value={subtaskTempTitle || subtask.title}
                  onChange={(e) => setSubtaskTempTitle(e.target.value)}
                  onBlur={() => handleSubtaskRename(subtask.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubtaskRename(subtask.id)}
                  autoFocus
                />
              ) : (
                <span
                  className="subtask-title"
                  onClick={() => {
                    setEditingSubId(subtask.id);
                    setSubtaskTempTitle(subtask.title);
                  }}
                >
                  {subtask.title}
                  {subtask.comment && (
                    <div className="subtask-tooltip">
                      {subtask.comment}
                    </div>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="task-due-date">
        <span role="img" aria-label="дата окончания">📅</span> {task.dueDate?.slice(0, 10)}
      </div>
    </div>
  );
};



const ProjectDetail = () => {
    const { id: projectId } = useParams();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  const [projectTitle, setProjectTitle] = useState(''); // 🆕 добавлено
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [executorModalTaskId, setExecutorModalTaskId] = useState(null);
  const [editingDueDateTask, setEditingDueDateTask] = useState(null);
  const [showEditDueDateModal, setShowEditDueDateModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentTarget, setCommentTarget] = useState(null);

  
  const fetchProject = useCallback(async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('Полученный проект:', res.data);
setProjectTitle(res.data.title);
  } catch (err) {
    console.error('Ошибка при получении названия проекта:', err);
  }
}, [projectId, token]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksWithSubtasks = await Promise.all(res.data.map(async (t) => {
        const subtasksRes = await axios.get(`${process.env.REACT_APP_API_URL}/subtasks/task/${t.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return { ...t, subtasks: subtasksRes.data };
      }));
      setTasks(tasksWithSubtasks);
    } catch (err) {
      console.error('Ошибка при загрузке задач:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  const fetchRole = useCallback(async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Members list from API:', res.data);  // Логируем список участников
    console.log('CurrentUserId from localStorage:', currentUserId); // Логируем userId из localStorage

    // Приводим типы для безопасного сравнения (если userId - число)
    const currentUserIdNum = Number(currentUserId);
    const current = res.data.find(m => m.userId === currentUserIdNum);

    console.log('Current user role object:', current);

    if (current) {
      setUserRole(current.role);
      console.log('Set userRole:', current.role);
    } else {
      console.warn('Current user not found in members list');
    }
  } catch (err) {
    console.error('Ошибка при получении роли:', err);
  }
}, [projectId, token, currentUserId]);

  console.log('Current userRole:', userRole); 
  useEffect(() => {
    fetchTasks();
    fetchRole();
    fetchProject();
    setContextMenu(null);
  }, [fetchTasks, fetchRole, fetchProject]);

  const handleAddSubtask = async (taskId) => {
    console.log('Добавление подзадачи к задаче ID:', taskId);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/subtasks`, {
        taskId,
        title: 'Новая подзадача',
        completed: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error("Ошибка при добавлении подзадачи:", err);
    }
  };

  const handleRenameTask = async (taskId, newTitle) => {
  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`, {
      title: newTitle
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTasks();
  } catch (err) {
    console.error("Ошибка при переименовании задачи:", err);
  }
};



const handleRenameSubtask = async (subtaskId, newTitle) => {
  try {
    let foundSubtask = null;

    for (const task of tasks) {
      const sub = task.subtasks.find(st => st.id === subtaskId);
      if (sub) {
        foundSubtask = sub;
        break;
      }
    }

    if (!foundSubtask) {
      throw new Error('Подзадача не найдена');
    }

    await axios.put(`${process.env.REACT_APP_API_URL}/subtasks/${subtaskId}`, {
      title: newTitle,
      completed: foundSubtask.completed ?? false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchTasks();
  } catch (err) {
    console.error("Ошибка при переименовании подзадачи:", err);
  }
};

  const handleToggleSubtask = async (taskId, subtaskIndex) => {
    try {
      const subtask = tasks.find(t => t.id === taskId).subtasks[subtaskIndex];
      await axios.put(`${process.env.REACT_APP_API_URL}/subtasks/${subtask.id}`, {
        completed: !subtask.completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error("Ошибка при переключении статуса подзадачи:", err);
    }
  };

const handleContextMenu = (e) => {
  if (userRole === 'member') return; // 🔒 блокируем для участника

  e.preventDefault();
  const x = e.pageX;
  const y = e.pageY;
  const taskId = e.target.closest('.task-card')?.getAttribute('data-id');
  const subtaskId = e.target.closest('.subtask-item')?.getAttribute('data-id');

  if (taskId && subtaskId) {
    const task = tasks.find(t => t.id === parseInt(taskId));
    const subIndex = task?.subtasks?.findIndex(st => st.id === parseInt(subtaskId));

    if (!task || subIndex === -1 || subIndex == null) return;

    const options = [];

    if (userRole === 'manager' || userRole === 'owner') {
      options.push({
        label: 'Комментарий',
        onClick: () => {
          setCommentTarget({ taskId, subtaskIndex: subIndex });
          setShowCommentModal(true);
          setContextMenu(null);
        }
      });
    }

    if (userRole !== 'member') {
      options.push({
        label: 'Удалить подзадачу',
        onClick: async () => {
          try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/subtasks/${subtaskId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
            setContextMenu(null);
          } catch (err) {
            console.error('Ошибка при удалении подзадачи:', err);
          }
        }
      });
    }

    setContextMenu({ x, y, options });
  } else if (taskId) {
    setContextMenu({
      x, y,
      options: [
        {
          label: 'Удалить задачу',
          onClick: async () => {
            try {
              await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchTasks();
              setContextMenu(null);
            } catch (err) {
              console.error('Ошибка при удалении задачи:', err);
            }
          }
        },
        {
          label: 'Изменить дату окончания',
          onClick: () => {
            const task = tasks.find(t => t.id.toString() === taskId?.toString());
            setEditingDueDateTask(task);
            setShowEditDueDateModal(true);
            setContextMenu(null);
          }
        },
        {
          label: 'Назначить исполнителя',
          onClick: () => {
            setExecutorModalTaskId(taskId);
            setContextMenu(null);
          }
        }
      ]
    });
  } else {
    setContextMenu({
      x, y,
      options: [
        {
          label: 'Создать задачу',
          onClick: async () => {
            try {
              await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks`, {
                title: 'Новая задача',
                description: '',
                dueDate: new Date().toISOString().slice(0, 10),
                priority: 'средний',
                status: 'новая',
                projectId: projectId
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchTasks();
            } catch (err) {
              console.error('Ошибка при создании задачи:', err);
            }
          }
        }
      ]
    });
  }
};


  const handleCloseContextMenu = () => setContextMenu(null);

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    setTasks((prev) => {
      return prev.map((task) => {
        if (task.id === active.id) {
          const newX = (task.x || 0) + delta.x;
          const newY = (task.y || 0) + delta.y;
          axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task.id}`, {
            x: newX,
            y: newY
          }, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error('Ошибка обновления координат', err));
          return { ...task, x: newX, y: newY };
        }
        return task;
      });
    });
  };

  if (loading) {
    return <p style={{ padding: '20px', fontSize: '18px' }}>Загрузка задач...</p>;
  }
  console.log('Current userRole:', userRole);
  return (
    <div className="project-detail-container" onContextMenu={handleContextMenu}>
    <div className="header-bar">
  <button className="back-button" onClick={() => window.location.href = '/projects'}>Вернуться</button>
  <h2 className="project-title">{projectTitle}</h2>
  {userRole !== 'member' && (
    <button className="btn members" onClick={() => setShowMembersModal(true)}>Участники</button>
  )}

</div>
      {showCommentModal && commentTarget && (
  <CommentModal
    isOpen={true}
    onSave={async (newComment) => {
      const subtaskId = tasks
        .find(t => t.id === parseInt(commentTarget.taskId))
        .subtasks[commentTarget.subtaskIndex].id;

      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/subtasks/${subtaskId}/comment`, {
          comment: newComment
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTasks();
      } catch (err) {
        console.error("Ошибка при сохранении комментария:", err);
      } finally {
        setShowCommentModal(false);
        setCommentTarget(null);
      }
    }}
    onClose={() => {
      setShowCommentModal(false);
      setCommentTarget(null);
    }}
  />
)}

      {showMembersModal && userRole !== 'member' && (
        <ProjectMembersModal
          projectId={projectId}
          userRole={userRole}
          onClose={() => setShowMembersModal(false)}
        />
      )}



      {executorModalTaskId && (
        <AssignExecutorModal
          projectId={projectId}
          taskId={executorModalTaskId}
          onClose={() => setExecutorModalTaskId(null)}
          onAssigned={fetchTasks}
        />
      )}

      {showEditDueDateModal && editingDueDateTask && (
        <EditDueDateModal
          task={editingDueDateTask}
          onClose={() => {
            setEditingDueDateTask(null);
            setShowEditDueDateModal(false);
          }}
          onSave={async (newDate) => {
            try {
              await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${editingDueDateTask.id}`, {
                dueDate: newDate
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchTasks();
            } catch (err) {
              console.error("Ошибка при сохранении даты:", err);
            } finally {
              setEditingDueDateTask(null);
              setShowEditDueDateModal(false);
            }
          }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="grid-workspace">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={handleToggleSubtask}
                onRename={handleRenameTask}
                onRenameSubtask={handleRenameSubtask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {contextMenu && userRole !== 'member' && (
        <ContextMenu {...contextMenu} onClose={handleCloseContextMenu} />
      )}
    </div>
  );
};

export default ProjectDetail;
