import React from 'react';
import AuthForm from '../components/AuthForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData, isLogin) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL;
      const url = isLogin
        ? `${baseUrl}/api/auth/login`
        : `${baseUrl}/api/auth/register`;

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
      console.log('📦 payload:', payload);
      console.log('📍 URL:', url);
      const response = await axios.post(url, payload, {
  headers: {
    'Content-Type': 'application/json'
  }
});
      console.log('📦 response.data:', response.data);
      const token = response.data.token;
     const user = response.data?.user;

if (token && user) {
  localStorage.setItem('token', token);
  localStorage.setItem('fullName', user.fullName || formData.username);
  localStorage.setItem('userId', String(user.id));
  navigate('/projects');
} else {
  alert('Неверный ответ от сервера');
}
    } catch (error) {
      console.error(error);
      alert('Ошибка при входе или регистрации');
    }
  };

  return <AuthForm onSubmit={handleSubmit} />;
};

export default AuthPage;
