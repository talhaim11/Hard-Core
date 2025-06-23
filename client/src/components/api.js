import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Auth ---
export const register = async (email, password, token, role) => {
  const response = await api.post('/register', { email, password, token, role });
  return response.data;
};

export const login = async (email, password, token) => {
  const response = await api.post('/login', { email, password, token });
  return response.data;
};

// --- Users ---
export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// --- Sessions ---
export const fetchSessions = async () => {
  const response = await api.get('/sessions');
  return response.data.sessions;
};

export const bookSession = async (date_time, token) => {
  const response = await api.post('/book-session', { date_time }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createSession = async (sessionData, token) => {
  const response = await api.post('/sessions', sessionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const cancelSession = async (sessionId, token) => {
  const response = await api.delete(`/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
};

// --- Me ---
export const getMe = async (token) => {
  const response = await api.get('/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// --- Attendance ---
export const getAttendance = async (token) => {
  const response = await api.get('/attendance', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const setAttendance = async (attendanceData, token) => {
  const response = await api.post('/attendance', attendanceData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// --- Interceptor for 401 ---
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location = '/';
    }
    return Promise.reject(err);
  }
);
  }
};
export const register = async (email, password, token, role) => {
  try {
    const response = await api.post('/register', { email, password, token, role });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
export const login = async (email, password, token) => {
  try {
    const response = await api.post('/login', { email, password, token });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
export const logout = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
export const deleteUserProfile = async () => {
  try {
    const response = await api.delete('/profile');
    return response.data;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};
export const fetchUserSessions = async () => {
  try {
    const response = await api.get('/user/sessions');
    return response.data;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
};

export const registerForSession = async (sessionId) => {
  try {
    const response = await api.post(`/user/sessions/${sessionId}/register`);
    return response.data;
  } catch (error) {
    console.error('Error registering for session:', error);
    throw error;
  }
};
export const cancelUserSession = async (sessionId) => {
  try {
    const response = await api.delete(`/user/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling user session:', error);
    throw error;
  }
};
export const fetchAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
};
export const fetchAdminUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};
export const createAdminUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
export const updateAdminUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};
export const deleteAdminUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
};
export const fetchAdminSessions = async () => {
  try {
    const response = await api.get('/admin/sessions');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin sessions:', error);
    throw error;
  }
};
export const createAdminSession = async (sessionData) => {
  try {
    const response = await api.post('/admin/sessions', sessionData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin session:', error);
    throw error;
  }
};
export const updateAdminSession = async (sessionId, sessionData) => {
  try {
    const response = await api.put(`/admin/sessions/${sessionId}`, sessionData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin session:', error);
    throw error;
  }
};
export const deleteAdminSession = async (sessionId) => {
  try {
    const response = await api.delete(`/admin/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin session:', error);
    throw error;
  }
};
export const fetchAdminReports = async () => {
  try {
    const response = await api.get('/admin/reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    throw error;
  }
};
export const generateAdminReport = async (reportType) => {
  try {
    const response = await api.post('/admin/reports', { reportType });
    return response.data;
  } catch (error) {
    console.error('Error generating admin report:', error);
    throw error;
  }
};
export const fetchAdminSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
};
export const updateAdminSettings = async (settingsData) => {
  try {
    const response = await api.put('/admin/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
};
export const fetchAdminNotifications = async () => {
  try {
    const response = await api.get('/admin/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
};
export const createAdminNotification = async (notificationData) => {
  try {
    const response = await api.post('/admin/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin notification:', error);
    throw error;
  }
};
export const updateAdminNotification = async (notificationId, notificationData) => {
  try {
    const response = await api.put(`/admin/notifications/${notificationId}`, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin notification:', error);
    throw error;
  }
};
export const deleteAdminNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/admin/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin notification:', error);
    throw error;
  }
};
export const fetchAdminLogs = async () => {
  try {
    const response = await api.get('/admin/logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    throw error;
  }
};
export const fetchAdminAnalytics = async () => {
  try {
    const response = await api.get('/admin/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    throw error;
  }
};
export const fetchAdminFeedback = async () => {
  try {
    const response = await api.get('/admin/feedback');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    throw error;
  }
};
export const createAdminFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/admin/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin feedback:', error);
    throw error;
  }
};
export const updateAdminFeedback = async (feedbackId, feedbackData) => {
  try {
    const response = await api.put(`/admin/feedback/${feedbackId}`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin feedback:', error);
    throw error;
  }
};
export const deleteAdminFeedback = async (feedbackId) => {
  try {
    const response = await api.delete(`/admin/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin feedback:', error);
    throw error;
  }
};
export const fetchAdminAnnouncements = async () => {
  try {
    const response = await api.get('/admin/announcements');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin announcements:', error);
    throw error;
  }
};
export const createAdminAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/admin/announcements', announcementData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin announcement:', error);
    throw error;
  }
};
export const updateAdminAnnouncement = async (announcementId, announcementData) => {
  try {
    const response = await api.put(`/admin/announcements/${announcementId}`, announcementData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin announcement:', error);
    throw error;
  }
};
export const deleteAdminAnnouncement = async (announcementId) => {
  try {
    const response = await api.delete(`/admin/announcements/${announcementId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin announcement:', error);
    throw error;
  }
};
export const fetchAdminResources = async () => {
  try {
    const response = await api.get('/admin/resources');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin resources:', error);
    throw error;
  }
};
export const createAdminResource = async (resourceData) => {
  try {
    const response = await api.post('/admin/resources', resourceData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin resource:', error);
    throw error;
  }
};
export const updateAdminResource = async (resourceId, resourceData) => {
  try {
    const response = await api.put(`/admin/resources/${resourceId}`, resourceData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin resource:', error);
    throw error;
  }
};
export const deleteAdminResource = async (resourceId) => {
  try {
    const response = await api.delete(`/admin/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin resource:', error);
    throw error;
  }
};

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location = '/';
    }
    return Promise.reject(err);
  }
);

// export const API_BASE = 'https://hard-core.onrender.com'; // כבר קיים אצלך
// export default api; // כבר קיים אצלך
// הוספת פונקציות נוספות לפי הצורך
