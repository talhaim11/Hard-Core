import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { adminUserManagerStyles, userListStyles, userItemStyles } from '../styles/AdminUserManagerStyles';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [role, setRole] = useState('user');

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://hard-core.onrender.com/users", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const addUser = async () => {
    try {
      await axios.post("https://hard-core.onrender.com/users", {
        email,
        password,
        token,
        role,
      }, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setEmail(''); setPassword(''); setToken('');
      fetchUsers();
    } catch (err) {
      alert("שגיאה בהוספת המשתמש");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={adminUserManagerStyles}>
      <h2>ניהול משתמשים</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" /><br />
      <input placeholder="Access Token" value={token} onChange={e => setToken(e.target.value)} /><br />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select><br />
      <button onClick={addUser}>הוסף משתמש</button>

      <h3>משתמשים רשומים:</h3>
      <ul className={userListStyles}>
        {users.map((u, i) => (
          <li key={i} className={userItemStyles}>{u.email} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}

// This component allows an admin to manage users, including adding new users and viewing the list of registered users.
// It uses axios to make API calls to the backend for user management.
// The component maintains state for the list of users, as well as form inputs for adding a new user.
// The `fetchUsers` function retrieves the list of users from the backend and updates the state.
// The `addUser` function sends a POST request to add a new user with the provided email, password, token, and role.
// The component renders a form for adding a new user and displays the list of registered users.
// Note: Make sure to replace the API endpoint with your actual backend URL if different.
// Ensure you have axios installed in your project: npm install axios
// Make sure to handle errors appropriately in a production application.
// This code is a React component for an admin panel that allows user management.
// It includes functionality to add new users and display a list of registered users.
// Ensure you have the necessary backend API endpoints set up to handle user management requests.
// This code is a React component for an admin panel that allows user management.
// It includes functionality to add new users and display a list of registered users.
// Ensure you have the necessary backend API endpoints set up to handle user management requests.
