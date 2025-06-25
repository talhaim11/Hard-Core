import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUserManager from '../components/AdminUserManager';
import WorkoutBoard from '../components/WorkoutBoard';
import SessionTable from '../components/SessionTable';
import '../styles/AdminPage.css';

const weightliftingSVG = (
  <svg className="admin-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="32" fill="#222"/>
    <rect x="10" y="29" width="44" height="6" rx="3" fill="#1e90ff"/>
    <rect x="14" y="22" width="4" height="20" rx="2" fill="#fff"/>
    <rect x="46" y="22" width="4" height="20" rx="2" fill="#fff"/>
    <rect x="24" y="26" width="16" height="12" rx="6" fill="#00c6fb"/>
    <circle cx="32" cy="32" r="4" fill="#fff"/>
  </svg>
);

const AdminPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!storedToken || role !== 'admin') {
      navigate('/');
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="admin-page">
      <div className="admin-content-card">
        {weightliftingSVG}
        <h1>ברוך הבא, אדמין!</h1>
        <button className="logout-btn" onClick={handleLogout}>התנתק</button>
        <div className="admin-section">
          <h2>ניהול משתמשים</h2>
          <AdminUserManager />
        </div>
        <div className="admin-section">
          <h2>טבלת מפגשים</h2>
          {token && <SessionTable token={token} />}
        </div>
        <div className="admin-section">
          <h2>לוח האימונים</h2>
          <WorkoutBoard token={token} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

