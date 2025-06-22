import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
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
      <ul>
        {users.map((u, i) => (
          <li key={i}>{u.email} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}
