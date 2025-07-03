import { useState } from "react";
import { API_BASE } from "../config";
import "../styles/Login.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email || !token || !newPassword || !confirmPassword) {
      setMessage("יש למלא את כל השדות.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("הסיסמאות לא תואמות.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, new_password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("הסיסמה אופסה בהצלחה! אפשר להתחבר.");
      } else {
        setMessage(data.error || "שגיאה באיפוס הסיסמה");
      }
    } catch (err) {
      setMessage("שגיאה בשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>איפוס סיסמה</h1>
        <form onSubmit={handleReset}>
          <label>
            שם משתמש
            <input
              type="text"
              placeholder="Username"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label>
            טוקן הרשמה
            <input
              type="text"
              placeholder="הזן את טוקן ההרשמה המקורי"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
          </label>
          <label>
            סיסמה חדשה
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </label>
          <label>
            אשר סיסמה חדשה
            <input
              type="password"
              placeholder="אשר סיסמה חדשה"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading} style={{marginTop:8}}>
            {loading ? "מאפס..." : "אפס סיסמה"}
          </button>
        </form>
        {message && <div style={{color: message.includes("בהצלחה") ? "green" : "red", marginTop: 12}}>{message}</div>}
        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <a href="/">חזרה להתחברות</a>
        </div>
      </div>
    </div>
  );
}
