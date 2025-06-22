import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import WorkoutBoard from '../components/WorkoutBoard';


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
