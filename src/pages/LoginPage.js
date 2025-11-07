import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation for demo purposes
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Mock login - in real app, this would call an API
    const userData = {
      id: 1,
      username: formData.username,
      role: formData.role,
      name: formData.role === 'admin' ? 'Admin User' : 'John Doe'
    };

    login(userData);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">BISU Boarding House System</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280' }}>
          Republic of the Philippines<br />
          Bohol Island State University<br />
          Tagbilaran City, 6300, Bohol, Philippines
        </p>
        
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Login As:</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <p>For demo purposes, enter any username and password</p>
          <p>Choose your role above to access different dashboards</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
