import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      console.log('Сырой ответ от сервера:', res);

      const data = await res.json();
      console.log('Ответ от сервера:', data);
      console.log('user из ответа:', data.user);
      console.log('user.id:', data.user?.id);

      console.log('data:', data);
      if (res.ok) {
        console.log('Ответ от сервера:', data);
        console.log('ID пользователя:', data.user?.id);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id);
        console.log('userId до записи:', data.user.id);
        console.log('data.user.id =', data.user?.id);
localStorage.setItem('userId', String(data.user.id));
console.log('userId в localStorage:', localStorage.getItem('userId'));
        navigate('/projects');
      } else {
        alert(data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      alert('Ошибка сервера');
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;
