// Add/view participants, pick random, and show picked history

import { useState, useEffect, useRef } from 'react';

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

export default function AdminPanel({ onLogout }) {
  const [participants, setParticipants] = useState(() => {
    return JSON.parse(localStorage.getItem('participants') || '[]');
  });
  const [name, setName] = useState('');
  const [picked, setPicked] = useState(() => {
    return JSON.parse(localStorage.getItem('picked') || '{}');
  });
  const [message, setMessage] = useState('');
  const [lastPick, setLastPick] = useState(null);

  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('picked', JSON.stringify(picked));
  }, [picked]);

  function addParticipant(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (participants.some(p => p.name === name.trim())) {
      setMessage('Participant already exists.');
      return;
    }
    setParticipants([...participants, { name: name.trim()}]);
    setName('');
    setMessage('');
  }

  function pickRandom() {
    const monthKey = getMonthKey();
    if (picked[monthKey]) {
      setMessage('Already picked for this month.');
      setLastPick(participants.find(p => p.name === picked[monthKey]));
      return;
    }
    const alreadyPicked = Object.values(picked);
    const available = participants.filter(p => !alreadyPicked.includes(p.name));
    if (available.length === 0) {
      setMessage('All participants have been picked. Resetting for new round.');
      setPicked({});
      setLastPick(null);
      return;
    }
    const winner = available[Math.floor(Math.random() * available.length)];
    setPicked({ ...picked, [monthKey]: winner.name });
    setLastPick(winner);
    setMessage(`Picked: ${winner.name}`);
  }

  function resetAll() {
    if (window.confirm('Reset all picks and participants?')) {
      setParticipants([]);
      setPicked({});
      setLastPick(null);
    }
  }

  function sharePickOnWhatsApp() {
    const monthKey = getMonthKey();
    const winnerName = picked[monthKey];
    if (!winnerName) {
      setMessage('No pick for this month to share.');
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent('This month\'s participant: ' + winnerName)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Random Name Picker</h2>
        <button className="logout-btn" onClick={onLogout}>🚪 Logout</button>
      </div>
      
      <form className="add-form" onSubmit={addParticipant}>
        <input
          className="input-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="👤 Add Participant"
        />
        <button className="add-btn" type="submit">➕ Add Member</button>
      </form>
      
      <div className="participants-list">
        <h3>👨‍👩‍👧‍👦 Participant Names ({participants.length})</h3>
        <div className="participants-grid">
          {participants.map(p => (
            <div className="participant-card" key={p.name}>
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
        <button className="pick-btn" onClick={pickRandom}>
          🎲 Pick This Month's Winner!
        </button>
        <button className="whatsapp-btn" onClick={sharePickOnWhatsApp}>
          Share on WhatsApp
        </button>
        <button className="reset-btn" onClick={resetAll}>
          🔄 Reset Everything
        </button>
        {message && <div className="message">📢 {message}</div>}
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
        {Object.keys(picked).length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No picks yet! Start by picking someone for this month.</p>
        ) : (
          <ul className="history-list">
            {Object.entries(picked).map(([month, p]) => {
              const part = participants.find(x => x.name === p);
              return (
                <li key={month} className="history-item">
                  <span style={{ fontWeight: 'bold', minWidth: '80px' }}>{month}:</span>
                  {part && part.image ? (
                    <img src={part.image} alt={part.name} className="history-img" />
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
                  <span>{p}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}