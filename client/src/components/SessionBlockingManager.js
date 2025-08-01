import React, { useState, useEffect } from 'react';
import { fetchSessions, blockSession, unblockSession, getBlockedSessions } from './api';
import '../styles/SessionBlockingManager.css';

export default function SessionBlockingManager() {
  const [sessions, setSessions] = useState([]);
  const [blockedSessions, setBlockedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
    loadBlockedSessions();
  }, []);

  const loadSessions = async () => {
    try {
      console.log('🔄 Loading sessions for SessionBlockingManager...');
      const sessionsData = await fetchSessions();
      console.log('📊 Raw sessions data:', sessionsData);
      console.log('📊 Is array?', Array.isArray(sessionsData));
      console.log('📊 Data length:', sessionsData?.length);
      console.log('📊 Data type:', typeof sessionsData);
      console.log('📊 Full data structure:', JSON.stringify(sessionsData, null, 2));
      
      // Check if it's wrapped in an object with a sessions property
      let finalSessions = [];
      if (Array.isArray(sessionsData)) {
        finalSessions = sessionsData;
      } else if (sessionsData && Array.isArray(sessionsData.sessions)) {
        finalSessions = sessionsData.sessions;
      } else if (sessionsData && typeof sessionsData === 'object') {
        console.log('📊 Object keys:', Object.keys(sessionsData));
        finalSessions = [];
      } else {
        finalSessions = [];
      }
      
      setSessions(finalSessions);
      console.log('✅ Final sessions set:', finalSessions);
      console.log('✅ Final sessions count:', finalSessions.length);
    } catch (err) {
      console.error('❌ Failed to fetch sessions:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setMessage('Failed to fetch sessions');
      setSessions([]); // Set empty array on error
    }
  };

  const loadBlockedSessions = async () => {
    try {
      const blockedData = await getBlockedSessions();
      // Ensure we always have an array
      setBlockedSessions(Array.isArray(blockedData) ? blockedData : []);
    } catch (err) {
      console.error('Failed to fetch blocked sessions:', err);
      setBlockedSessions([]); // Set empty array on error
    }
  };

  const handleBlockSession = async (sessionId, sessionInfo) => {
    if (!blockReason.trim()) {
      setMessage('Please provide a reason for blocking this session');
      return;
    }

    setLoading(true);
    try {
      await blockSession(sessionId, blockReason);
      setMessage(`Session blocked successfully: ${sessionInfo}`);
      setBlockReason('');
      setSelectedSession(null);
      loadSessions();
      loadBlockedSessions();
    } catch (err) {
      console.error('Error blocking session:', err);
      const errorMsg = err.response?.data?.error || 'Failed to block session';
      setMessage(`Failed to block session: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockSession = async (sessionId, sessionInfo) => {
    if (!window.confirm('Are you sure you want to unblock this session?')) return;

    setLoading(true);
    try {
      await unblockSession(sessionId);
      setMessage(`Session unblocked successfully: ${sessionInfo}`);
      loadSessions();
      loadBlockedSessions();
    } catch (err) {
      console.error('Error unblocking session:', err);
      const errorMsg = err.response?.data?.error || 'Failed to unblock session';
      setMessage(`Failed to unblock session: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const isSessionBlocked = (sessionId) => {
    // Safety check to ensure blockedSessions is an array
    if (!Array.isArray(blockedSessions)) {
      return false;
    }
    return blockedSessions.some(blocked => blocked.session_id === sessionId);
  };

  const formatSessionTime = (session) => {
    const date = new Date(session.date);
    const startTime = session.start_time || session.time;
    const endTime = session.end_time;
    
    if (endTime) {
      return `${date.toLocaleDateString()} (${startTime} - ${endTime})`;
    } else {
      return `${date.toLocaleDateString()} at ${startTime}`;
    }
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    // Set current time to start of day for fair comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log('🔍 Getting upcoming sessions...');
    console.log('📅 Current date/time:', now);
    console.log('� Today (start of day):', today);
    console.log('�📊 All sessions:', sessions);
    
    // Safety check to ensure sessions is an array
    if (!Array.isArray(sessions)) {
      console.log('❌ Sessions is not an array:', sessions);
      return [];
    }
    
    const upcoming = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      // Set session date to start of day for fair comparison
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      
      console.log(`📋 Session ${session.id}:`);
      console.log(`   Raw date: ${session.date}`);
      console.log(`   Parsed date: ${sessionDate}`);
      console.log(`   Session day: ${sessionDay}`);
      console.log(`   Today: ${today}`);
      console.log(`   Is upcoming? ${sessionDay >= today}`);
      
      return sessionDay >= today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('🔮 Upcoming sessions:', upcoming);
    return upcoming;
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const upcomingSessions = getUpcomingSessions();
  console.log('🎯 Upcoming sessions for render:', upcomingSessions);

  return (
    <div className="session-blocking-manager">
      <h3>🚫 Session Blocking Management</h3>
      <p className="info-text">You have been granted permission to block/unblock gym sessions.</p>
      
      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="sessions-container">
        <div className="upcoming-sessions">
          <h4>📅 Upcoming Sessions</h4>
          {upcomingSessions.length === 0 ? (
            <p>No upcoming sessions found.</p>
          ) : (
            <div className="sessions-grid">
              {upcomingSessions.map(session => {
                const blocked = isSessionBlocked(session.id);
                const sessionInfo = formatSessionTime(session);
                
                return (
                  <div key={session.id} className={`session-card ${blocked ? 'blocked' : 'available'}`}>
                    <div className="session-info">
                      <strong>{sessionInfo}</strong>
                      <span className="session-status">
                        {blocked ? '🚫 BLOCKED' : '✅ Available'}
                      </span>
                    </div>
                    
                    <div className="session-actions">
                      {blocked ? (
                        <button 
                          onClick={() => handleUnblockSession(session.id, sessionInfo)}
                          disabled={loading}
                          className="unblock-btn"
                        >
                          🔓 Unblock Session
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedSession(session)}
                          disabled={loading}
                          className="block-btn"
                        >
                          🚫 Block Session
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Block Session Modal */}
        {selectedSession && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Block Session: {formatSessionTime(selectedSession)}</h4>
              <p>Please provide a reason for blocking this session:</p>
              
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Equipment maintenance, Emergency closure, etc."
                rows={4}
                className="reason-textarea"
              />
              
              <div className="modal-actions">
                <button 
                  onClick={() => handleBlockSession(selectedSession.id, formatSessionTime(selectedSession))}
                  disabled={loading || !blockReason.trim()}
                  className="confirm-block-btn"
                >
                  {loading ? 'Blocking...' : '🚫 Block Session'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedSession(null);
                    setBlockReason('');
                  }}
                  disabled={loading}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Currently Blocked Sessions */}
        {blockedSessions.length > 0 && (
          <div className="blocked-sessions">
            <h4>🚫 Currently Blocked Sessions</h4>
            <div className="blocked-list">
              {blockedSessions.map(blocked => {
                const session = sessions.find(s => s.id === blocked.session_id);
                if (!session) return null;
                
                return (
                  <div key={blocked.id} className="blocked-item">
                    <div className="blocked-info">
                      <strong>{formatSessionTime(session)}</strong>
                      <span className="block-reason">Reason: {blocked.reason}</span>
                      <span className="blocked-by">Blocked by: {blocked.blocked_by_email}</span>
                    </div>
                    <button 
                      onClick={() => handleUnblockSession(session.id, formatSessionTime(session))}
                      disabled={loading}
                      className="unblock-btn-small"
                    >
                      🔓 Unblock
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
