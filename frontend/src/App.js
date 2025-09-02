import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TechnicianDashboard from './components/TechnicianDashboard';
import DentistDashboard from './components/DentistDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/technician" 
            element={
              <ProtectedRoute requiredRole="Technician">
                <TechnicianDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dentist" 
            element={
              <ProtectedRoute requiredRole="Dentist">
                <DentistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;