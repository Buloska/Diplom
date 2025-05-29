import React from 'react';
import PrivateRoute from './components/PrivateRoute';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthPage from './pages/authpage';
import ProjectDetail from './pages/projectdetail';
import GlobalTasks from './pages/GlobalTasks';
import ProjectsPage from './pages/projects'; // 👈 импортируем страницу проектов

function App() {
  return (
    <Router>
      <Routes>
        {/* Стартовая страница — окно входа/регистрации */}
        <Route path="/" element={<AuthPage />} />

        {/* Защищённый маршрут для проектов */}
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/global-tasks"
          element={
            <PrivateRoute>
              <GlobalTasks />
            </PrivateRoute>
          }
        />

        {/* Если путь не найден — редирект на главную */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
