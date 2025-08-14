import { useState, useEffect, useRef } from 'react';

const API_BASE ='https://randompickerbackend.onrender.com/api';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

export default function AdminPanel({ onLogout }) {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [lastPick, setLastPick] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef();

  // Fetch participants on component mount
  useEffect(() => {
    fetchParticipants();
    fetchHistory();
  }, []);

  async function fetchParticipants() {
    try {
      const response = await fetch(`${API_BASE}/admin/participants`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      } else if (response.status === 401 || response.status === 403) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setMessage('Error loading participants');
    }
  }

  async function fetchHistory() {
    try {
      const response = await fetch(`${API_BASE}/viewer/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        
        // Check if there's a winner for current month
        const currentMonth = getMonthKey();
        const currentWinner = data.find(h => h.month === currentMonth);
        if (currentWinner) {
          const participant = participants.find(p => p.name === currentWinner.personName);
          setLastPick({
            name: currentWinner.personName,
            image: currentWinner.image || participant?.image
          });
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }

  async function addParticipant(e) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('Please enter a name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/participants`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: name.trim(), 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setParticipants(prev => [...prev, data]);
        setName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage(`✅ ${data.name} added successfully!`);
      } else {
        setMessage(data.error || 'Failed to add participant');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function pickRandom() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/pick`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setLastPick(data.winner);
        setMessage(data.message);
        
        // Refresh history to show new pick
        await fetchHistory();
      } else {
        setMessage(data.error || 'Failed to pick participant');
      }
    } catch (error) {
      console.error('Error picking participant:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function resetAll() {
    if (!window.confirm('Reset all picks and participants? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/reset`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setParticipants([]);
        setHistory([]);
        setLastPick(null);
        setMessage('✅ Everything reset successfully!');
      } else {
        setMessage(data.error || 'Failed to reset');
      }
    } catch (error) {
      console.error('Error resetting:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function resetPicks() {
    if (!window.confirm('Reset all picks only? Participants will be kept.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/reset-picks`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setHistory([]);
        setLastPick(null);
        setMessage('✅ All picks reset successfully!');
      } else {
        setMessage(data.error || 'Failed to reset picks');
      }
    } catch (error) {
      console.error('Error resetting picks:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function sharePickOnWhatsApp() {
    if (!lastPick) {
      setMessage('No pick for this month to share.');
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent('🎉 This month\'s family activity participant: ' + lastPick.name + ' 🎉')}`;
    window.open(url, '_blank');
  }

  function handleLogout() {
    sessionStorage.removeItem('adminToken');
    onLogout();
  }

  // Auto-clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>👑Admin Panel</h2>
        <button className="logout-btn" onClick={handleLogout} disabled={loading}>
          🚪 Logout
        </button>
      </div>
      
      <form className="add-form" onSubmit={addParticipant}>
        <input
          className="input-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="👤 Add family member name"
        />
        <button className="add-btn" type="submit">➕ Add Member</button>
      </form>
      
      <div className="participants-list">
        <h3>👨‍👩‍👧‍👦 Participants ({participants.length})</h3>
        <div className="participants-grid">
          {participants.map(p => (
            <div className="participant-card" key={p._id}>
              {p.image ? (
                <img src={p.image} alt={p.name} className="participant-img" />
              ) : (
                <div className="participant-img" style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: 'white'
                }}>
                  👤
                </div>
              )}
              <div className="participant-name">{p.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pick-section">
        <button className="pick-btn" onClick={pickRandom} disabled={loading}>
          {loading ? '⏳ Picking...' : '🎲 Pick This Month\'s Winner!'}
        </button>
        <button className="whatsapp-btn" onClick={sharePickOnWhatsApp} disabled={!lastPick}>
          📱 Share on WhatsApp
        </button>
        <div className="reset-buttons">
          <button className="reset-btn" onClick={resetPicks} disabled={loading}>
            🔄 Reset Picks Only
          </button>
          <button className="reset-btn danger" onClick={resetAll} disabled={loading}>
            🔥 Reset Everything
          </button>
        </div>
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : ''}`}>
            📢 {message}
          </div>
        )}
        {lastPick && (
          <div className="winner-card">
            <h3>🏆 This Month's Winner!</h3>
            {lastPick.image ? (
              <img src={lastPick.image} alt={lastPick.name} className="winner-img" />
            ) : (
              <div className="winner-img" style={{
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white'
              }}>
                👤
              </div>
            )}
            <div className="winner-name">🎉 {lastPick.name} 🎉</div>
          </div>
        )}
      </div>
      
      <div className="history-section">
        <h3>📅 Monthly Pick History</h3>
        {history.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No picks yet! Start by picking someone for this month.
          </p>
        ) : (
          <ul className="history-list">
            {history.map((item, index) => (
              <li key={index} className="history-item">
                <span style={{ fontWeight: 'bold', minWidth: '80px' }}>
                  {item.month}:
                </span>
                {item.image ? (
                  <img src={item.image} alt={item.personName} className="history-img" />
                ) : (
                  <div className="history-img" style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    color: 'white'
                  }}>
                    👤
                  </div>
                )}
                <span>{item.personName}</span>
                <small style={{ color: '#666', marginLeft: '10px' }}>
                  {new Date(item.pickedAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}