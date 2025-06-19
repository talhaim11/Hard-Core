import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'user') {
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
      <h1>ברוך הבא, משתמש!</h1>
      <button onClick={handleLogout}>התנתק</button>
    </div>
  );
};

export default UserPage;
