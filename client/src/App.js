import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import AdminPage from "./AdminPage";
import UserPage from "./UserPage";
import AdminUserManager from "./AdminUserManager"; // ✅ הוספת קובץ הניהול

function App() {
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setRole={setRole} />} />

        <Route
          path="/admin"
          element={
            role === "admin" ? <AdminPage /> : role === null ? null : <Navigate to="/" />
          }
        />
        
        {/* ✅ דף ניהול משתמשים - רק לאדמין */}
        <Route
          path="/admin/users"
          element={
            role === "admin" ? <AdminUserManager /> : <Navigate to="/" />
          }
        />

        <Route
          path="/user"
          element={
            role === "user" ? <UserPage /> : role === null ? null : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
