import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUserManager from '../components/AdminUserManager';
import SessionList from '../components/SessionList';
import WorkoutBoard from '../components/WorkoutBoard';
import { API_BASE } from '../config';
import '../styles/AdminPage.css';
import '../styles/AdminUserManager.css';
import '../styles/SessionList.css';

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

// This is the AdminPage component that checks if the user is logged in and has the correct role.
// If not, it redirects them to the login page. It also provides a logout button to
// clear the local storage and redirect to the login page.
// It includes components for managing users and displaying workout sessions.
// Make sure to import this component in your main App.js file and set up the route for
// it. For example, in App.js, you would add:
// <Route path="/admin" element={<AdminPage />} />
// This code is a React component for an admin page that checks if the user is logged in
// and has the correct role. If not, it redirects them to the login page.
// It also provides a logout button to clear the local storage and redirect to the login page.
// It includes components for managing users and displaying workout sessions.
// Make sure to import this component in your main App.js file and set up the route for
// it. For example, in App.js, you would add:
// <Route path="/admin" element={<AdminPage />} />
import AdminUserManager from '../components/AdminUserManager';
import SessionList from '../components/SessionList';
import WorkoutBoard from '../components/WorkoutBoard';
import '../styles/AdminPage.css';
import '../styles/AdminUserManager.css';
import '../styles/SessionList.css';

  export default AdminPage;

