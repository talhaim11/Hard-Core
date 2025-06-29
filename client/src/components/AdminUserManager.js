import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import '../styles/AdminUserManager.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const deleteUserHandler = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted!');
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      const errorMsg = err.response?.data?.error || 'Failed to delete user';
      alert(`Failed to delete user: ${errorMsg}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-user-manager">
      <h2>ניהול משתמשים</h2>
      <div style={{ color: '#1e90ff', marginBottom: 12 }}>
        משתמשים חדשים מתווספים דרך טוקן הזמנה בלבד (ראה לשונית "ניהול טוקנים")
      </div>
      <h3 className="user-list-label">משתמשים רשומים:</h3>
      <input
        type="text"
        className="user-search"
        placeholder="חפש משתמש..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom: '0.5rem', width: '90%'}}
      />
      <ul className="user-list scrollable-user-list">
        {filteredUsers.map((u, i) => (
          <li key={i} className="user-item">
            {u.email} ({u.role})
            <button className="delete-user-btn" onClick={() => deleteUserHandler(u.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// This component allows an admin to manage users, including viewing the list of registered users and deleting existing users.
// It uses axios to make API calls to the backend for user management.
// The component maintains state for the list of users, as well as form inputs for searching users.
// The `fetchUsers` function retrieves the list of users from the backend and updates the state.
// The `deleteUserHandler` function sends a DELETE request to remove a user by their ID.
// The component renders a search input and displays the list of registered users with an option to delete each user.
// Note: Make sure to replace the API endpoint with your actual backend URL if different.
// Ensure you have axios installed in your project: npm install axios
// Make sure to handle errors appropriately in a production application.
// This code is a React component for an admin panel that allows user management.
// It includes functionality to view a list of registered users and delete users.
// Ensure you have the necessary backend API endpoints set up to handle user management requests.
// This code is a React component for an admin panel that allows user management.
// It includes functionality to view a list of registered users and delete users.
// Ensure you have the necessary backend API endpoints set up to handle user management requests.
