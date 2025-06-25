import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchSessions } from './api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminStats = () => {
  const [userCount, setUserCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [attendanceData, setAttendanceData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await fetchUsers();
        setUserCount(users.length || (users.users && users.users.length) || 0);
        const sessionData = await fetchSessions();
        const sessions = Array.isArray(sessionData) ? sessionData : sessionData.sessions || [];
        setSessionCount(sessions.length);
        if (sessions.length > 0) {
          const total = sessions.reduce((sum, s) => sum + (s.participants || 0), 0);
          setAvgAttendance((total / sessions.length).toFixed(1));
          setAttendanceData({
            labels: sessions.map(s => s.date || s.title),
            datasets: [
              {
                label: 'Attendance',
                data: sessions.map(s => s.participants || 0),
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.3,
              },
            ],
          });
        } else {
          setAvgAttendance(0);
          setAttendanceData({ labels: [], datasets: [] });
        }
      } catch {
        setUserCount(0);
        setSessionCount(0);
        setAvgAttendance(0);
        setAttendanceData({ labels: [], datasets: [] });
      }
    };
    loadStats();
  }, []);

  return (
    <div className="admin-stats">
      <div className="stat-box">
        <div className="stat-label">משתמשים רשומים</div>
        <div className="stat-value">{userCount}</div>
      </div>
      <div className="stat-box">
        <div className="stat-label">מספר מפגשים</div>
        <div className="stat-value">{sessionCount}</div>
      </div>
      <div className="stat-box">
        <div className="stat-label">ממוצע משתתפים</div>
        <div className="stat-value">{avgAttendance}</div>
      </div>
      <div className="analytics-chart" style={{ marginTop: 32 }}>
        <h4>Attendance Trends</h4>
        <Line data={attendanceData} />
      </div>
    </div>
  );
};

export default AdminStats;
