import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { TrendingUp, Users, AlertTriangle, Printer, ShoppingBag, ArrowDownLeft } from 'lucide-react';

export default function Reports() {
  const [metrics, setMetrics] = useState({ totalBorrowed: 0, activeDebtors: 0, overdueCount: 0 });
  const [masterTimeline, setMasterTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch KPI metrics summary from loans
      const { data: loans } = await supabase.from('loans').select('balance_remaining, status, item_name, issue_date, due_date, principal_amount, customers(first_name, last_name)');
      
      let total = 0;
      let debtorsCount = 0;
      let overdue = 0;

      if (loans) {
        loans.forEach(l => {
          if (l.status === 'Active' || l.status === 'Overdue') {
            total += parseFloat(l.balance_remaining || 0);
            debtorsCount++;
          }
          if (l.status === 'Overdue') overdue++;
        });
      }
      setMetrics({ totalBorrowed: total, activeDebtors: debtorsCount, overdueCount: overdue });

      // 2. Fetch all repayment logs to include in master audit activity stream
      const { data: repayments } = await supabase
        .from('repayments')
        .select('*, loans(item_name, customers(first_name, last_name))');

      // 3. Merge both operational feeds into a unified transaction stream
      const combined = [
        ...(loans || []).map((l, index) => ({
          id: `report-loan-${index}`,
          customerName: l.customers ? `${l.customers.first_name} ${l.customers.last_name}` : 'Unknown Client',
          date: l.issue_date,
          dueDate: l.due_date, // Captured issue deadline
          type: 'credit',
          amount: l.principal_amount,
          detail: l.item_name || 'Retail Credit Line',
          channel: 'Store Inventory'
        })),
        ...(repayments || []).map(r => ({
          id: `report-repay-${r.repayment_id}`,
          customerName: r.loans?.customers ? `${r.loans.customers.first_name} ${r.loans.customers.last_name}` : 'Unknown Client',
          date: r.payment_date,
          dueDate: null, // Repayments do not have maturity deadlines
          type: 'repayment',
          amount: r.amount_paid,
          detail: `Cleared part of: ${r.loans?.item_name || 'Credit Row'}`,
          channel: r.payment_method
        }))
      ];

      // Sort chronologically: Newest transaction entries shown at the top of the ledger sheets
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Keep recent 15 transactions for a digestible ledger list view
      setMasterTimeline(combined.slice(0, 15));
    } catch (err) {
      console.error("Error generating master statements:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-1 md:p-0">
      {/* Header with Print Feature */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Financial Insights</h2>
          <p className="text-xs md:text-sm text-slate-400">Monitor running capital distributions and universal transaction history logs.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-100"
        >
          <Printer size={14} /> Print Report
        </button>
      </div>

      {/* Hidden Header for Paper Print Out Only */}
      <div className="hidden print:block border-b pb-2 mb-4">
        <h1 className="text-2xl font-black text-slate-900">Ledgerly Shop Credit Report</h1>
        <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Outstanding Balance</p>
            <p className="text-base font-black text-slate-800">KSh {metrics.totalBorrowed.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Accounts</p>
            <p className="text-base font-black text-slate-800">{metrics.activeDebtors} Clients</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Overdue Flags</p>
            <p className="text-base font-black text-slate-800">{metrics.overdueCount} Alerts</p>
          </div>
        </div>
      </div>

      {/* Master Transaction Ledger Sheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Master Store Activity Stream</h3>
        
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 px-2">Type / Item Description</th>
                  <th className="py-2 px-2">Date Taken</th>
                  <th className="py-2 px-2">Date Due</th>
                  <th className="py-2 px-2">Channel</th>
                  <th className="py-2 pl-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-slate-400">Compiling financial timeline sheets...</td>
                  </tr>
                ) : masterTimeline.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-slate-400">No operational movements tracked yet.</td>
                  </tr>
                ) : (
                  masterTimeline.map(tx => {
                    const isCredit = tx.type === 'credit';
                    return (
                      <tr key={tx.id} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                          {tx.customerName}
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`p-1 rounded-md inline-flex items-center justify-center ${
                              isCredit ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {isCredit ? <ShoppingBag size={12} /> : <ArrowDownLeft size={12} />}
                            </span>
                            <span className="font-semibold text-slate-700">{tx.detail}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">
                          {tx.date ? new Date(tx.date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          {isCredit && tx.dueDate ? (
                            <span className="text-rose-600 font-semibold bg-rose-50/60 px-1.5 py-0.5 rounded-md">
                              {new Date(tx.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 px-2">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span className={`font-semibold text-[10px] px-1.5 py-0.5 rounded-md ${
                            isCredit ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {tx.channel}
                          </span>
                        </td>
                        <td className={`py-2.5 pl-2 text-right font-black whitespace-nowrap ${
                          isCredit ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {isCredit ? `+ KSh ${tx.amount}` : `- KSh ${tx.amount}`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}