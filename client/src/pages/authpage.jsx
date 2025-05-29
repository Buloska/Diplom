import React from 'react';
import AuthForm from '../components/AuthForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    
  const navigate = useNavigate();

  const handleSubmit = async (formData, isLogin) => {
    try {
      const url = isLogin
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/register';

      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            fullName: formData.username,
            email: formData.email,
            password: formData.password
          };

      const response = await axios.post(url, payload);
      const token = response.data.token;
      const fullName = response.data.user.fullName || formData.username; // fallback если backend не вернёт

      if (token) {
         localStorage.setItem('token', token);
          localStorage.setItem('fullName', fullName);
  localStorage.setItem('userId', String(response.data.user.id)); // ✅ вот это добавь
  navigate('/projects');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при входе или регистрации');
    }
  };

  return <AuthForm onSubmit={handleSubmit} />;
};

export default AuthPage;
