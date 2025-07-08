import React, { useState, useEffect } from 'react';
import { fetchAdminMessages, createAdminMessage, deleteAdminMessage } from './api';
import '../styles/AdminMessageManager.css';

const AdminMessageManager = ({ showNotification }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    content: '',
    duration_hours: 24,
    priority: 'normal'
  });
  const [loading, setLoading] = useState(true);

  const loadMessages = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdminMessages();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      showNotification('שגיאה בטעינת הודעות', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.content.trim()) {
      showNotification('נא להזין תוכן הודעה', 'error');
      return;
    }

    try {
      await createAdminMessage(newMessage);
      setNewMessage({
        content: '',
        duration_hours: 24,
        priority: 'normal'
      });
      showNotification('הודעה נוצרה בהצלחה', 'success');
      loadMessages();
    } catch (error) {
      console.error('Error creating message:', error);
      showNotification('שגיאה ביצירת הודעה', 'error');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('האם את/ה בטוח/ה שברצונך למחוק הודעה זו?')) {
      return;
    }

    try {
      await deleteAdminMessage(messageId);
      showNotification('הודעה נמחקה בהצלחה', 'success');
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification('שגיאה במחיקת הודעה', 'error');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('he-IL');
  };

  const isMessageActive = (message) => {
    const now = new Date();
    const createdAt = new Date(message.created_at);
    const expiresAt = new Date(createdAt.getTime() + (message.duration_hours * 60 * 60 * 1000));
    return now <= expiresAt;
  };

  if (loading) {
    return <div className="loading">טוען הודעות...</div>;
  }

  return (
    <div className="admin-message-manager">
      {/* Create New Message Form */}
      <div className="message-form-section">
        <h3>יצירת הודעה חדשה</h3>
        <form onSubmit={handleCreateMessage} className="message-form">
          <div className="form-group">
            <label htmlFor="message-content">תוכן ההודעה:</label>
            <textarea
              id="message-content"
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              placeholder="הזן את תוכן ההודעה כאן..."
              rows={4}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">משך זמן תצוגה (שעות):</label>
              <select
                id="duration"
                value={newMessage.duration_hours}
                onChange={(e) => setNewMessage({ ...newMessage, duration_hours: parseInt(e.target.value) })}
              >
                <option value={1}>שעה אחת</option>
                <option value={6}>6 שעות</option>
                <option value={12}>12 שעות</option>
                <option value={24}>24 שעות (יום)</option>
                <option value={48}>48 שעות (יומיים)</option>
                <option value={72}>72 שעות (3 ימים)</option>
                <option value={168}>שבוע</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">עדיפות:</label>
              <select
                id="priority"
                value={newMessage.priority}
                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
              >
                <option value="low">נמוכה</option>
                <option value="normal">רגילה</option>
                <option value="high">גבוהה</option>
                <option value="urgent">דחוף</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="create-message-btn">
            צור הודעה
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="messages-list-section">
        <h3>הודעות קיימות</h3>
        {messages.length === 0 ? (
          <div className="no-messages">אין הודעות במערכת</div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-item ${isMessageActive(message) ? 'active' : 'expired'} priority-${message.priority}`}
              >
                <div className="message-header">
                  <div className="message-status">
                    {isMessageActive(message) ? (
                      <span className="status-badge active">פעילה</span>
                    ) : (
                      <span className="status-badge expired">פגה תוקף</span>
                    )}
                    <span className={`priority-badge priority-${message.priority}`}>
                      {message.priority === 'low' && 'נמוכה'}
                      {message.priority === 'normal' && 'רגילה'}
                      {message.priority === 'high' && 'גבוהה'}
                      {message.priority === 'urgent' && 'דחוף'}
                    </span>
                  </div>
                  <button 
                    className="delete-message-btn"
                    onClick={() => handleDeleteMessage(message.id)}
                    title="מחק הודעה"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="message-content">
                  {message.content}
                </div>
                
                <div className="message-meta">
                  <div>נוצרה: {formatDateTime(message.created_at)}</div>
                  <div>משך: {message.duration_hours} שעות</div>
                  <div>פוגה: {formatDateTime(new Date(new Date(message.created_at).getTime() + (message.duration_hours * 60 * 60 * 1000)))}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessageManager;
