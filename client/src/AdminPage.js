import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUserManager from './AdminUserManager'; // ✅ הוספת הקומפוננטה

const AdminPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>ברוך הבא, אדמין!</h1>
      <button onClick={handleLogout}>התנתק</button>

      {/* ✅ ממשק ניהול המשתמשים */}
      <AdminUserManager />
    </div>
  );
};

export default AdminPage;
