import { useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Viewer from './components/Viewer';
import './App.css';

function App() {
  const [view, setView] = useState(() => {
    // If admin is logged in, default to admin panel
    return localStorage.getItem('isAdmin') === 'true' ? 'admin' : 'viewer';
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');

  function handleAdminLogin() {
    setIsAdmin(true);
    setView('admin');
    localStorage.setItem('isAdmin', 'true');
  }

  function handleLogout() {
    setIsAdmin(false);
    setView('viewer');
    localStorage.removeItem('isAdmin');
  }

  return (
    <div className="container">
      <div className="family-card">
        <h1>Random Name Picker</h1>
      </div>
      
      <header>
        <nav>
          <button 
            onClick={() => setView('viewer')}
            style={{ background: view === 'viewer' ? 'linear-gradient(135deg, #4caf50, #45a049)' : '' }}
          >
            👀 Viewer
          </button>
          <button 
            onClick={() => setView('admin')}
            style={{ background: view === 'admin' ? 'linear-gradient(135deg, #4caf50, #45a049)' : '' }}
          >
            👑 Admin
          </button>
        </nav>
      </header>
      
      {view === 'admin' ? (
        isAdmin ? (
          <AdminPanel onLogout={handleLogout} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        )
      ) : (
        <Viewer />
      )}
    </div>
  );
}

export default App;