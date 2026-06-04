import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, Wallet } from 'lucide-react';

export default function CustomerHistoryModal({ customer, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // Pull historical lines linking through structural ID parameters
      const { data } = await supabase
        .from('repayments')
        .select('*, loans(customer_id, principal_amount)')
        .eq('loans.customer_id', customer.customer_id);
      
      // Filter out null rows returned by inner relational logic matching criteria
      setPayments((data || []).filter(item => item.loans !== null));
      setLoading(false);
    };
    fetchHistory();
  }, [customer]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full border shadow-xl flex flex-col max-h-[80vh]">
        <div className="border-b pb-3 mb-4 flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Transaction Ledger History</h3>
            <p className="text-xs text-sky-500 font-semibold">{customer.first_name} {customer.last_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Compiling audit rows...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No historical records found for this account profile.</p>
          ) : (
            payments.map(p => (
              <div key={p.repayment_id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={13} />
                    {new Date(p.payment_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Wallet size={13} className="text-slate-400" />
                    Via: <span className="font-bold text-slate-700 bg-white border px-1.5 py-0.5 rounded-md text-[10px]">{p.payment_method}</span>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                  + KSh {p.amount_paid}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}