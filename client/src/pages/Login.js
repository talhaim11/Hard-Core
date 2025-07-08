import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const BACKEND_URL = API_BASE || "https://gym-backend-staging.onrender.com";

function Login({ setRole }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "admin" ? "/admin" : "/user");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
        console.log('🔧 LOGIN: Attempting to connect to:', `${API_BASE}/login`);
        const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
        });

      const data = await response.json();
      console.log("Login response data:", data);
      console.log("Set role to:", data.role);

      if (data.token && data.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setRole(data.role);
        navigate(data.role === "admin" ? "/admin" : "/user");
      } else {
        alert(data.error || data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  };

    return ( 
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>
        <label>
          Username
          <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <button onClick={handleLogin}>Login</button>
        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <span>New user? </span>
          <a href="/register">Register here</a>
        </div>
        <div style={{textAlign: 'center', marginTop: '0.5rem'}}>
          <a href="/reset-password">Forgot password?</a>
        </div>
      </div>
    </div>
    );
}

export default Login;

// This code defines a simple login page for a React application.
// It includes input fields for email and password.
// When the user clicks the "Login" button, it sends a POST request to the server with the provided credentials.
// If the login is successful, it stores the token and role in local storage and navigates
// the user to either the admin or user page based on their role.
// If the login fails, it displays an alert with the error message.
// Make sure to import this component in your main App.js file and set up the route for it.
// A link to the registration page is also provided for new users.
