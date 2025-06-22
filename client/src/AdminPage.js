import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUserManager from './AdminUserManager';
import SessionList from './SessionList';
import WorkoutBoard from './WorkoutBoard';
import { API_BASE } from './config';
import './AdminPage.css';
import './AdminUserManager.css';
import './SessionList.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!storedToken || role !== 'admin') {
      navigate('/login');
    } else {
      setToken(storedToken); // נשמור את הטוקן
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="admin-page">
      <h1>ברוך הבא, אדמין!</h1>
      <button onClick={handleLogout}>התנתק</button>

      <h2>ניהול משתמשים</h2>
      <p>כאן תוכל לנהל את המשתמשים במערכת.</p>    
      <AdminUserManager />
      <WorkoutBoard />

      <h2>לוח האימונים</h2>
      {token && <SessionList token={token} />}
    </div>
  );
  };

  export default AdminPage;

