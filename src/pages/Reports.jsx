import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { TrendingUp, Users, AlertTriangle, Printer } from 'lucide-react';

export default function Reports() {
  const [metrics, setMetrics] = useState({ totalBorrowed: 0, activeDebtors: 0, overdueCount: 0 });
  const [recentRepayments, setRecentRepayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    const { data: loans } = await supabase.from('loans').select('balance_remaining, status');
    
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

    const { data: repayments } = await supabase
      .from('repayments')
      .select('*, loans(customers(first_name, last_name))')
      .order('payment_date', { ascending: false })
      .limit(5);

    setRecentRepayments(repayments || []);
    setLoading(false);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-1 md:p-0">
      {/* Header with Print Feature */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">Financial Insights</h2>
          <p className="text-xs md:text-sm text-slate-400">Monitor running capital distributions and incoming payment logs.</p>
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

      {/* Tightened Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Outstanding</p>
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

      {/* Tightened Table Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Recent Income Streams</h3>
        
        {/* Horizontal scroll support for tight mobile viewports */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Channel</th>
                  <th className="py-2 pl-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-400">Loading sheets...</td>
                  </tr>
                ) : recentRepayments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-400">No repayments tracked yet.</td>
                  </tr>
                ) : (
                  recentRepayments.map(r => (
                    <tr key={r.repayment_id} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                        {r.loans?.customers ? `${r.loans.customers.first_name} ${r.loans.customers.last_name}` : 'Unknown Client'}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 whitespace-nowrap">
                        {new Date(r.payment_date).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-1.5 py-0.5 rounded-md">
                          {r.payment_method}
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right font-bold text-emerald-600 whitespace-nowrap">
                        KSh {r.amount_paid}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}