import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">OralVis Healthcare</h1>
          <span className="header-role">{user.role} Portal</span>
        </div>
        
        <div className="header-right">
          <span className="header-user">Welcome, {user.email}</span>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;