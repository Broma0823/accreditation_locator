import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="https://via.placeholder.com/40x40/1e40af/ffffff?text=BISU" 
            alt="BISU Logo" 
            className="logo"
          />
          <a href="/" className="navbar-brand">
            BISU Boarding House System
          </a>
        </div>
        <ul className="navbar-nav">
          {user?.role === 'admin' && (
            <>
              <li><a href="/admin">Dashboard</a></li>
              <li><a href="/admin/form">Accreditation Form</a></li>
              <li><a href="/admin/map">Map</a></li>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <li><a href="/student">Dashboard</a></li>
              <li><a href="/student/map">Map</a></li>
            </>
          )}
          <li>
            <button 
              onClick={logout}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '4px'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
