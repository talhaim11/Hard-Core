import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import Register from "./pages/Register"; // Import Register page
import ResetPassword from "./pages/ResetPassword";

// import WorkoutBoard from './components/WorkoutBoard'; // Disabled: unused import

// import { API_BASE } from "./config"; // Disabled: unused import
import './styles/App.css'; // Import your global styles here
import './styles/AdminPage.css';
import './styles/UserPage.css';
import './styles/WorkoutBoard.css';
import './styles/Login.css';
import './styles/UserDashboard.css'; // Import UserDashboard styles


function App() {
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole) {
      setRole(storedRole);
    }
    
    // Force 24-hour format globally
    document.documentElement.setAttribute('lang', 'en-GB');
    
    // Add global style to hide AM/PM
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
      input[type="time"]::-webkit-datetime-edit-ampm-field {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
        visibility: hidden !important;
        position: absolute !important;
        left: -9999px !important;
        opacity: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }
    `;
    if (!document.head.querySelector('style[data-global-24h]')) {
      globalStyle.setAttribute('data-global-24h', 'true');
      document.head.appendChild(globalStyle);
    }
  }, []);

   return ( 
    <Router>
      <Routes>
        <Route path="/login" element={<Login setRole={setRole} />} />
        <Route path="/" element={<Login setRole={setRole} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
