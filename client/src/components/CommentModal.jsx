import React, { useState } from 'react';
import './CommentModal.css'; // не забудь стили

const CommentModal = ({ isOpen, onClose, onSave, initialComment = '' }) => {
  const [comment, setComment] = useState(initialComment);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (comment.trim()) {
      onSave(comment);
      setComment('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Комментарий к подзадаче</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите комментарий"
        />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Сохранить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
