import { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Viewer from './components/Viewer';
import './App.css';

function App() {
  const [view, setView] = useState('viewer');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is already logged in as admin
  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
      setView('admin');
    }
  }, []);

  function handleAdminLogin() {
    setIsAdmin(true);
    setView('admin');
  }

  function handleLogout() {
    setIsAdmin(false);
    setView('viewer');
    sessionStorage.removeItem('adminToken');
  }

  function switchToView(newView) {
    // If trying to access admin without being logged in, show login
    if (newView === 'admin' && !isAdmin) {
      setView('admin');
    } else {
      setView(newView);
    }
  }

  return (
    <div className="container">
      <div className="family-card">
        <h1>🏠 Family Participant Picker</h1>
        <p>A fun way to pick family members for monthly activities! 👨‍👩‍👧‍👦</p>
      </div>
      
      <header>
        <nav>
          <button 
            className={view === 'viewer' ? 'active' : ''}
            onClick={() => switchToView('viewer')}
          >
            👀 Family View
          </button>
          <button 
            className={view === 'admin' ? 'active' : ''}
            onClick={() => switchToView('admin')}
          >
            👑 Admin {isAdmin ? '(Logged in)' : ''}
          </button>
        </nav>
      </header>
      
      <main>
        {view === 'admin' ? (
          isAdmin ? (
            <AdminPanel onLogout={handleLogout} />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        ) : (
          <Viewer />
        )}
      </main>
    </div>
  );
}

export default App;