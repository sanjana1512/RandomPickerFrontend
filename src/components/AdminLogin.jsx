import { useState } from 'react';

const API_BASE = 'https://randompickerbackend.onrender.com';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store admin token
        sessionStorage.setItem('adminToken', data.token);
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
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
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '🔄 Logging in...' : '🔐 Login'}
        </button>
        {error && <div className="error-message">❌ {error}</div>}
      </form>
    </div>
  );
}