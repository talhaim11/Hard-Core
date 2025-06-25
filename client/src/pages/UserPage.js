import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboard from '../components/UserDashboard';

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
    navigate('/'); // Redirect to root instead of /login
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>ברוך הבא, משתמש!</h1>
      <button onClick={handleLogout}>התנתק</button>
      <UserDashboard />
    </div>
  );
};

export default UserPage;

// This is a simple user page component that checks if the user is logged in and has the correct role.
// If not, it redirects them to the login page. It also provides a logout button to
// clear the local storage and redirect to the login page.
// You can expand this component to include user-specific features or information as needed.
// Make sure to import this component in your main App.js file and set up the route for it.
// For example, in App.js, you would add:
// <Route path="/user" element={<UserPage />} />
// This code is a React component for a user page that checks if the user is logged in and has the correct role.
// If not, it redirects them to the login page. It also provides a logout button to
// clear the local storage and redirect to the login page.
// You can expand this component to include user-specific features or information as needed.
// Make sure to import this component in your main App.js file and set up the route for it.
