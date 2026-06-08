import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, Wallet, ShoppingBag, ArrowDownLeft, X } from 'lucide-react';

export default function CustomerHistoryModal({ customer, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompleteHistory = async () => {
      setLoading(true);
      try {
        // 1. Fetch all store credit lines / items advanced to this customer
        const { data: loans, error: loanErr } = await supabase
          .from('loans')
          .select('*')
          .eq('customer_id', customer.customer_id);

        if (loanErr) throw loanErr;

        // 2. Fetch all cash collections / payments processed for this customer
        const { data: repayments, error: repayErr } = await supabase
          .from('repayments')
          .select('*, loans!inner(customer_id)')
          .eq('loans.customer_id', customer.customer_id);

        if (repayErr) throw repayErr;

        // 3. Combine into a unified operational transaction timeline
        const combinedTransactions = [
          ...(loans || []).map(l => ({
            id: `loan-${l.loan_id}`,
            date: l.issue_date,
            dueDate: l.due_date,
            type: 'credit',
            amount: l.principal_amount,
            details: l.item_name || 'Retail Credit Advanced',
            status: l.status
          })),
          ...(repayments || []).map(r => ({
            id: `repay-${r.repayment_id}`,
            date: r.payment_date,
            dueDate: null,
            type: 'repayment',
            amount: r.amount_paid,
            details: `Repayment processed via ${r.payment_method}`,
            status: 'Completed'
          }))
        ];

        // Sort chronologically: Newest transaction records always displayed at the top
        combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTimeline(combinedTransactions);
      } catch (err) {
        console.error("Error generating master ledger statement:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (customer?.customer_id) {
      fetchCompleteHistory();
    }
  }, [customer]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full border shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* Modal Header Panel */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Account Audit Statement</h3>
            <p className="text-xs text-sky-600 font-bold">{customer.first_name} {customer.last_name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Master Transaction Log Render Pipeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-8">Compiling universal ledger rows...</p>
          ) : timeline.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No historical transactions logged for this client profile.</p>
          ) : (
            timeline.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div 
                  key={tx.id} 
                  className={`p-3.5 border rounded-xl flex items-start justify-between text-sm transition-all ${
                    isCredit ? 'bg-amber-50/40 border-amber-100/70' : 'bg-emerald-50/40 border-emerald-100/70'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Dynamic Context Icon Badge */}
                    <div className={`p-2 rounded-xl h-fit mt-0.5 ${
                      isCredit ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isCredit ? <ShoppingBag size={15} /> : <ArrowDownLeft size={15} />}
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-slate-700 leading-tight">
                        {isCredit ? `Credit: ${tx.details}` : tx.details}
                      </div>
                      
                      <div className="text-[11px] text-slate-400 flex flex-col gap-0.5 pt-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar size={12} /> {isCredit ? 'Issued' : 'Date'}: {new Date(tx.date).toLocaleDateString()}
                        </span>
                        {isCredit && tx.dueDate && (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            ⚠️ Pay Due: {new Date(tx.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Absolute Value Summaries */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`font-extrabold text-xs px-2 py-0.5 rounded-lg ${
                      isCredit ? 'text-amber-700 bg-amber-100/60' : 'text-emerald-700 bg-emerald-100/60'
                    }`}>
                      {isCredit ? `+ KSh ${tx.amount}` : `- KSh ${tx.amount}`}
                    </span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}