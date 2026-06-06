import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CustomerForm from '../components/CustomerForm';
import CustomerHistoryModal from '../components/CustomerHistoryModal';
import { History, Trash2 } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setCustomers(data || []);
  };

  const handleDeleteCustomer = async (customerId) => {
    const confirmDelete = window.confirm("Are you sure you want to completely delete this customer? This will remove all their loan history!");
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('customer_id', customerId);

      if (error) throw error;

      // Optimistically update state so the customer disappears from UI instantly
      setCustomers(customers.filter(c => c.customer_id !== customerId));
    } catch (error) {
      console.error("Error deleting customer:", error.message);
      alert("Failed to delete customer. Make sure any dependent loan records are handled.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Customer Accounts</h2>
        <p className="text-sm text-slate-400">View registered profiles and view individual loan timelines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <CustomerForm onCustomerAdded={fetchCustomers} />
        
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-xs border-b border-slate-100">
                  <th className="p-4">NAME</th>
                  <th className="p-4">CONTACT LINE</th>
                  <th className="p-4 text-center">ACCOUNT ACCRUALS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {customers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{c.first_name} {c.last_name}</td>
                    <td className="p-4 text-slate-500">{c.phone_number}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedCustomer(c)} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all"
                        >
                          <History size={14} /> View History
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCustomer(c.customer_id)}
                          className="inline-flex items-center p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                          title="Delete Customer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerHistoryModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}
