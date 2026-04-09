import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import PasswordModal from './components/PasswordModal';

function App() {
  return (
    <Router>
      <AdminProvider>
        <div className="app-container">
          <Navbar />
          <main className="container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <PasswordModal />
        </div>
      </AdminProvider>
    </Router>
  );
}

export default App;
