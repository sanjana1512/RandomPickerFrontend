// Simple admin login form (frontend only, no backend)
import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const ADMIN_PASSWORD = "admin"; // Family-friendly password

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Incorrect password! Try "family2025"');
    }
  }

  return (
    <div className="login-form">
      <h2>👑 Admin Access</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Enter admin password to manage participants
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">🔓 Login</button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}