import { useState, useEffect } from "react";

const API_BASE = 'https://randompickerbackend.onrender.com/api';

export default function Viewer() {
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load current winner on component mount
  useEffect(() => {
    viewWinner();
  }, []);

  async function viewWinner() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/viewer/current`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.message) {
          // No winner picked yet
          setWinner(null);
          setError(data.message);
        } else {
          setWinner(data);
        }
        setShowHistory(false);
      } else {
        setError('Failed to fetch current winner');
      }
    } catch (err) {
      console.error('Error fetching winner:', err);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/viewer/history`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data);
        setShowHistory(true);
        setWinner(null);
      } else {
        setError('Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <h2>👁️View</h2>
      </div>

      <div className="viewer-controls">
        <button 
          className={`view-btn ${!showHistory ? 'active' : ''}`}
          onClick={viewWinner}
          disabled={loading}
        >
          {loading && !showHistory ? '⏳ Loading...' : '🏆 Current Winner'}
        </button>
        <button 
          className={`view-btn ${showHistory ? 'active' : ''}`}
          onClick={fetchHistory}
          disabled={loading}
        >
          {loading && showHistory ? '⏳ Loading...' : '📅 View History'}
        </button>
      </div>

      <div className="viewer-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {showHistory ? (
          <div className="history-view">
            <h3>📅 Monthly Pick History</h3>
            {history.length === 0 ? (
              <div className="no-data">
                <p>📝 No history available yet.</p>
                <p>Ask an admin to pick the first winner!</p>
              </div>
            ) : (
              <div className="history-grid">
                {history.map((item, idx) => (
                  <div key={idx} className="history-card">
                    <div className="history-month">{item.month}</div>
                    <div className="history-winner">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.personName} 
                          className="history-winner-img" 
                        />
                      ) : (
                        <div className="history-winner-img placeholder">
                          👤
                        </div>
                      )}
                      <div className="history-winner-name">{item.personName}</div>
                    </div>
                    <div className="history-date">
                      {new Date(item.pickedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="current-winner-view">
            {winner ? (
              <div className="current-winner-card">
                <h3>🏆 This Month's Winner</h3>
                <div className="winner-display">
                  {winner.image ? (
                    <img 
                      src={winner.image} 
                      alt={winner.personName} 
                      className="current-winner-img" 
                    />
                  ) : (
                    <div className="current-winner-img placeholder">
                      👤
                    </div>
                  )}
                  <div className="current-winner-name">
                    🎉 {winner.personName} 🎉
                  </div>
                </div>
                <div className="winner-details">
                  <p><strong>Month:</strong> {winner.month}</p>
                  <p><strong>Selected on:</strong> {new Date(winner.pickedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            ) : (
              !loading && (
                <div className="no-winner">
                  <div className="no-winner-icon">🎲</div>
                  <h3>No Winner Yet!</h3>
                  <p>No one has been picked for this month yet.</p>
                  <p>Ask an admin to pick someone!</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}