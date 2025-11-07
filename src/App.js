import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Navbar from './components/Navbar';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route 
          path="/admin" 
          element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/student" />} 
        />
        <Route 
          path="/student" 
          element={user.role === 'student' ? <StudentDashboard /> : <Navigate to="/admin" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
