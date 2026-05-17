import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { DramaPlayer } from './pages/DramaPlayer';
import { Search } from './pages/Search';
import { Navbar } from './components/Navbar';

import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { WelcomeScreen } from './components/WelcomeScreen';

function AppContent() {
  const [hasId, setHasId] = useState<boolean>(true); // assume true first to avoid flicker, then check in useEffect
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Check if userId exists in localStorage 
    const userId = localStorage.getItem('userId');
    if (!userId && !isAdminRoute) {
      setHasId(false);
    } else {
      setHasId(true);
    }
  }, [location.pathname, isAdminRoute]);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-50 font-sans selection:bg-rose-500/30">
      {(!hasId && !isAdminRoute) && <WelcomeScreen onComplete={() => setHasId(true)} />}
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/search" element={<><Navbar /><Search /></>} />
        <Route path="/history" element={<><Navbar /><History /></>} />
        <Route path="/profile" element={<><Navbar /><Profile /></>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/play/:id" element={<DramaPlayer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
