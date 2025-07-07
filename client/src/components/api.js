import axios from 'axios';
import { API_BASE } from '../config';   // כבר קיים אצלך

const api = axios.create({
  baseURL: API_BASE,          // https://hard-core.onrender.com
  headers: {
    'Content-Type': 'application/json',
  },
});

// מוסיף Bearer באופן אוטומטי לפני כל בקשה
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- DRY API HELPERS ---
const apiGet = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};
const apiPost = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    throw error;
  }
};
const apiPut = async (url, data) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error putting to ${url}:`, error);
    throw error;
  }
};
const apiDelete = async (url) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${url}:`, error);
    throw error;
  }
};

// --- API EXPORTS (DRY) ---
export const fetchUsers = () => apiGet('/users');
export const addUser = (email, password, token, role) => apiPost('/register', { email, password, token, role });
export const fetchSessions = () => apiGet('/sessions');
export const registerSession = (sessionId) => apiPost(`/sessions/${sessionId}/register`);
export const cancelSession = (sessionId) => apiDelete(`/sessions/${sessionId}`);
export const createSession = (sessionData) => apiPost('/sessions', sessionData);
export const updateSession = (sessionId, sessionData) => apiPut(`/sessions/${sessionId}`, sessionData);
export const deleteSession = (sessionId) => apiDelete(`/sessions/${sessionId}`);
// Bulk delete sessions by range/filter
export const deleteSessionsBulk = (criteria) => api.delete('/sessions/bulk', { data: criteria }).then(res => res.data);
// Delete all sessions older than 6 months
export const deleteOldSessions = () => api.delete('/sessions/past').then(res => res.data);
export const login = (email, password, token) => apiPost('/login', { email, password, token });
export const logout = () => apiPost('/logout');
export const getUserProfile = () => apiGet('/profile');
export const updateUserProfile = (profileData) => apiPut('/profile', profileData);
export const fetchUserNotifications = () => apiGet('/notifications').then(data => data.notifications);
export const fetchUserAchievements = () => apiGet('/achievements').then(data => data.achievements);
export const deleteUserProfile = () => apiDelete('/profile');
export const fetchUserSessions = () => apiGet('/user/sessions');
export const cancelUserSession = (sessionId) => apiDelete(`/sessions/${sessionId}`);
export const fetchAdminDashboard = () => apiGet('/admin/dashboard');
export const fetchAdminUsers = () => apiGet('/admin/users');
export const createAdminUser = (userData) => apiPost('/admin/users', userData);
export const updateAdminUser = (userId, userData) => apiPut(`/admin/users/${userId}`, userData);
export const deleteAdminUser = (userId) => apiDelete(`/admin/users/${userId}`);
export const fetchAdminSessions = () => apiGet('/admin/sessions');
export const createAdminSession = (sessionData) => apiPost('/admin/sessions', sessionData);
export const updateAdminSession = (sessionId, sessionData) => apiPut(`/admin/sessions/${sessionId}`, sessionData);
export const deleteAdminSession = (sessionId) => apiDelete(`/admin/sessions/${sessionId}`);
export const fetchAdminReports = () => apiGet('/admin/reports');
export const generateAdminReport = async (reportType) => {
  try {
    const response = await api.post('/admin/reports', { reportType });
    return response.data;
  } catch (error) {
    console.error('Error generating admin report:', error);
    throw error;
  }
};
export const fetchAdminSettings = () => apiGet('/admin/settings');
export const updateAdminSettings = async (settingsData) => {
  try {
    const response = await api.put('/admin/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
};
export const fetchAdminNotifications = () => apiGet('/admin/notifications');
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
export const fetchAdminLogs = () => apiGet('/admin/logs');
export const fetchAdminAnalytics = () => apiGet('/admin/analytics');
export const fetchAdminFeedback = () => apiGet('/admin/feedback');
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
export const fetchAdminAnnouncements = () => apiGet('/admin/announcements');
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
export const fetchAdminResources = () => apiGet('/admin/resources');
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
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Subscription-related API exports
export const fetchUserSubscription = () => apiGet('/user/subscription-status');
export const createSubscription = (subscriptionData) => apiPost('/subscriptions', subscriptionData);
export const updateSubscription = (subscriptionId, subscriptionData) => apiPut(`/subscriptions/${subscriptionId}`, subscriptionData);
export const deleteSubscription = (subscriptionId) => apiDelete(`/subscriptions/${subscriptionId}`);
export const fetchAllSubscriptions = () => apiGet('/subscriptions');
export const fetchUserSubscriptions = () => apiGet('/user/subscriptions');

// Admin Messages API exports
export const fetchAdminMessages = () => apiGet('/admin/messages');
export const createAdminMessage = (messageData) => apiPost('/admin/messages', messageData);
export const deleteAdminMessage = (messageId) => apiDelete(`/admin/messages/${messageId}`);
export const fetchUserMessages = () => apiGet('/user/messages');

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
