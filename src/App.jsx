import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Login />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      {/* Responsive Main Panel */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 md:ml-64 min-h-screen transition-all">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'customers' && <Customers />}
        {currentPage === 'reports' && <Reports />}
        {currentPage === 'profile' && <Profile />}
      </main>
    </div>
  );
}