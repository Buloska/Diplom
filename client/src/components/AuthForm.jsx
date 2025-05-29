import React, { useState } from 'react';
import './AuthForm.css';

const AuthForm = ({ onSubmit }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }

    if (!isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = 'Никнейм обязателен';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        newErrors.username = 'Только латиница, цифры, "_" или "-"';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Минимум 3 символа';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Повторите пароль';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData, isLogin);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/logo.png" alt="Logo" className="auth-logo" />
        <h2>{isLogin ? 'Вход в аккаунт' : 'Создать аккаунт'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Никнейм"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <div className="auth-error">{errors.username}</div>
              )}
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="auth-error">{errors.email}</div>}

          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="auth-error">{errors.password}</div>
          )}

          {!isLogin && (
            <>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <div className="auth-error">{errors.confirmPassword}</div>
              )}
            </>
          )}

          <button type="submit">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? 'Нет аккаунта? Зарегистрироваться'
            : 'Уже есть аккаунт? Войти'}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
