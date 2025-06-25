import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import '../styles/Login.css';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        alert("Registration successful! Please log in.");
        navigate("/");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Register</h1>
        <label>
          Email
          <input
            type="email"
            placeholder="Email"
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
        <label>
          Access Token
          <input
            type="text"
            placeholder="Access Token"
            value={token}
            onChange={e => setToken(e.target.value)}
          />
        </label>
        <button onClick={handleRegister}>Register</button>
        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <span>Already have an account? </span>
          <a href="/">Login here</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
