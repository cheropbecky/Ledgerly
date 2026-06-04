import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function CustomerForm({ onCustomerAdded }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('customers')
      .insert([{ first_name: firstName, last_name: lastName, phone_number: phone, email }]);

    setLoading(false);
    if (error) alert(error.message);
    else {
      setFirstName(''); setLastName(''); setPhone(''); setEmail('');
      if (onCustomerAdded) onCustomerAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-md">
      <h3 className="text-lg font-semibold text-gray-700">Register New Customer</h3>
      <div className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="p-2 border rounded-lg text-sm" />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required className="p-2 border rounded-lg text-sm" />
      </div>
      <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-2 border rounded-lg text-sm" />
      <input type="email" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
      <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
        {loading ? 'Registering...' : 'Register Customer'}
      </button>
    </form>
  );
}