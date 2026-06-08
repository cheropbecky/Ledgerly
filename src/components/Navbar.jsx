import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ setCurrentPage, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
     { id: 'dashboard', name: 'Loan', icon: LayoutDashboard }, // Changed name from 'Dashboard' to 'Loan'
     { id: 'customers', name: 'Customers', icon: Users },
     { id: 'reports', name: 'Reports', icon: FileText },
     { id: 'profile', name: 'Business Profile', icon: Settings }, 
   ];
  const handleNavClick = (id) => {
    setCurrentPage(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">L</div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Ledgerly</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-1">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Shared Navbar Shell */}
      <nav className={`w-64 bg-white border-r border-slate-100 fixed h-full flex flex-col justify-between p-4 z-40 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0 pt-20' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo Branding */}
          <div className="hidden md:flex items-center gap-2.5 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-sky-100">
              L
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Ledgerly<span className="text-sky-500">.</span>
            </h1>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-sky-50 text-sky-600 shadow-sm shadow-sky-50/50' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-sky-500' : 'text-slate-400'} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </>
  );
}