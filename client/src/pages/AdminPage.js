import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUserManager from '../components/AdminUserManager';
import WorkoutBoard from '../components/WorkoutBoard';
import SessionTable from '../components/SessionTable';
import '../styles/AdminPage.css';

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
      <h1>ברוך הבא, אדמין!</h1>
      <button className="logout-btn" onClick={handleLogout}>התנתק</button>
      <div className="admin-section">
        <h2>ניהול משתמשים</h2>
        <p>כאן תוכל לנהל את המשתמשים במערכת.</p>
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
  );
};

export default AdminPage;

