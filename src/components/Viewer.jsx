// Viewer can see the current month's pick and pick history
import { useState, useEffect } from 'react';

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

function getMonthName(monthKey) {
  const [year, month] = monthKey.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default function Viewer() {
  const [picked, setPicked] = useState(() => {
    return JSON.parse(localStorage.getItem('picked') || '{}');
  });
  const [participants, setParticipants] = useState(() => {
    return JSON.parse(localStorage.getItem('participants') || '[]');
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPicked(JSON.parse(localStorage.getItem('picked') || '{}'));
      setParticipants(JSON.parse(localStorage.getItem('participants') || '[]'));
    }, 2000); // Poll every 2s for updates
    return () => clearInterval(interval);
  }, []);

  const monthKey = getMonthKey();
  const currentWinnerName = picked[monthKey];
  const currentWinner = participants.find(p => p.name === currentWinnerName);

  return (
    <div className="viewer-section">
      <div className="current-pick">
        <h2>🗓 {getMonthName(monthKey)} Winner</h2>
        {currentWinner ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {currentWinner.image ? (
              <img 
                src={currentWinner.image} 
                alt={currentWinner.name} 
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '5px solid #4caf50',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                }}
              />
            ) : (
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                color: 'white',
                border: '5px solid #4caf50',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
              }}>
                👤
              </div>
            )}
            <div className="current-winner">🎉 {currentWinner.name} 🎉</div>
          </div>
        ) : currentWinnerName ? (
          <div className="current-winner">🎉 {currentWinnerName} 🎉</div>
        ) : (
          <div className="no-pick">🤔 No one has been picked yet this month!</div>
        )}
      </div>
      
      <div className="history-section">
        <h3>📅 Previous Monthly Winners</h3>
        {Object.keys(picked).length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
            No picks yet! Check back after the admin picks someone.
          </p>
        ) : (
          <ul className="history-list">
            {Object.entries(picked)
              .sort(([a], [b]) => b.localeCompare(a)) // Sort newest first
              .map(([month, p]) => {
                const part = participants.find(x => x.name === p);
                return (
                  <li key={month} className="history-item">
                    <span style={{ fontWeight: 'bold', minWidth: '150px' }}>
                      {getMonthName(month)}:
                    </span>
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
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{p}</span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        padding: '1rem',
        background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
        borderRadius: '16px',
        color: '#666'
      }}>
      </div>
    </div>
  );
}