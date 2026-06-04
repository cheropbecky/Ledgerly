import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    // If email is empty, cleanly substitute a phone-alias email so Supabase Auth works out of the box
    const cleanEmail = email.trim() ? email.trim() : `${phone.trim()}@ledgerly.internal`;

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { display_name: name, phone_number: phone }
        }
      });
      if (error) alert(error.message);
      else alert("Account created successfully! You can now Sign In.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) alert(error.message + " Hint: If you registered without email, use your phone number entry.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-sky-100">L</div>
          <h2 className="text-2xl font-extrabold text-slate-800">{isSignUp ? 'Create Admin Account' : 'Welcome to Ledgerly'}</h2>
          <p className="text-sm text-slate-400">{isSignUp ? 'Register your storefront ledger' : 'Sign in to manage retail credit lines'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">FULL NAME *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="e.g. Brenda Akinyi" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">PHONE NUMBER *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="e.g. 0712345678" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL ADDRESS (OPTIONAL)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="admin@shop.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">PASSWORD *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-sky-100 mt-2">
            {loading ? 'Processing...' : isSignUp ? 'Register Storefront' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-semibold text-sky-500 hover:underline">
            {isSignUp ? 'Already have an account? Sign In' : 'New store setup? Create an Account'}
          </button>
        </div>
      </div>
    </div>
  );
}