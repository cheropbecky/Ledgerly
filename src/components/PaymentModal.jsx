import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PaymentModal({ loan, onClose, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('M-Pesa');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return alert("Enter a valid amount");

    setLoading(true);
    try {
      // 1. Persist transaction with payment tracking mechanisms
      const { error: payError } = await supabase
        .from('repayments')
        .insert([{ loan_id: loan.loan_id, amount_paid: paymentAmount, payment_method: method }]);
      if (payError) throw payError;

      // 2. Automated evaluation of outstanding credit totals
      const newBalance = Math.max(0, loan.balance_remaining - paymentAmount);
      const newStatus = newBalance === 0 ? 'Paid' : loan.status;

      const { error: loanError } = await supabase
        .from('loans')
        .update({ balance_remaining: newBalance, status: newStatus })
        .eq('loan_id', loan.loan_id);
      if (loanError) throw loanError;

      onPaymentSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full border shadow-xl space-y-4">
        <h3 className="font-extrabold text-lg text-slate-800">Process Repayment</h3>
        
        <div>
          <p className="text-xs text-slate-400">Recording for: <span className="font-bold text-slate-700">{loan.customers?.first_name} {loan.customers?.last_name}</span></p>
          {/* Display Item details pulled from the loan object */}
          <p className="text-[11px] text-sky-600 bg-sky-50 font-semibold px-2 py-1 rounded-md mt-1 inline-block">
            Item: {loan.item_name || 'Retail Credit Line'}
          </p>
        </div>

        {/* Enhanced summary showing the timeline details */}
        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
          <div className="flex justify-between text-slate-500">
            <span>Taken On:</span>
            <span className="font-medium text-slate-700">{loan.issue_date ? new Date(loan.issue_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Payment Due:</span>
            <span className="font-medium text-rose-600">{loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Unresolved Balance:</span>
            <span className="font-bold text-slate-800">KSh {loan.balance_remaining}</span>
          </div>
        </div>
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">AMOUNT PAID (KSh)</label>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">PAYMENT METHOD</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500">
              <option value="M-Pesa">M-Pesa</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-500 text-white font-bold rounded-xl text-sm hover:bg-sky-600 shadow-md shadow-sky-50 transition-all">
              {loading ? 'Saving...' : 'Authorize Clear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}