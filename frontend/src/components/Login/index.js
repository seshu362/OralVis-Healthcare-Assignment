import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'Technician') {
          navigate('/technician');
        } else if (userData.role === 'Dentist') {
          navigate('/dentist');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.message === 'Login successful') {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Redirect based on role
        if (response.data.data.user.role === 'Technician') {
          navigate('/technician');
        } else if (response.data.data.user.role === 'Dentist') {
          navigate('/dentist');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'Technician') {
      setFormData({
        email: 'technician@oralvis.com',
        password: 'tech123'
      });
    } else {
      setFormData({
        email: 'dentist@oralvis.com',
        password: 'dentist123'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>OralVis Healthcare</h1>
          <p>Please sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-text">Demo Login:</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => handleDemoLogin('Technician')}
            >
              Technician Demo
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => handleDemoLogin('Dentist')}
            >
              Dentist Demo
            </button>
          </div>
          <div style={{ marginTop: 24 }}>
            <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/register')}
            style={{ width: '100%' }}
            >
            New? Register
            </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;