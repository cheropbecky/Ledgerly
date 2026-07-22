import { useEffect, useState } from "react";
import { Wallet, Package, Users2, TrendingUp } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    inventoryValue: 0,
    activeBorrowers: 0,
    totalIssued: 0,
  });
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [{ data: loans }, { data: items }] = await Promise.all([
        supabase
          .from("loans")
          .select(
            "loan_id, customer_id, item_name, balance_remaining, principal_amount, status, due_date, profiles(first_name, last_name, phone, email)"
          )
          .order("due_date"),
        supabase.from("credit_items").select("price, stock_quantity"),
      ]);

      const activeLoans = (loans || []).filter((l) => l.status !== "Paid");

      const totalOutstanding = activeLoans.reduce(
        (sum, l) => sum + Number(l.balance_remaining),
        0
      );
      const totalIssued = (loans || []).reduce((sum, l) => sum + Number(l.principal_amount), 0);
      const inventoryValue = (items || []).reduce(
        (sum, i) => sum + Number(i.price) * Number(i.stock_quantity),
        0
      );
      const activeBorrowers = new Set(activeLoans.map((l) => l.customer_id)).size;

      setStats({ totalOutstanding, inventoryValue, activeBorrowers, totalIssued });
      setBorrowers(activeLoans);
      setLoading(false);
    }
    loadStats();
  }, []);

  const cards = [
    {
      label: "Total outstanding credit",
      value: stats.totalOutstanding,
      icon: Wallet,
      tone: "debit",
    },
    {
      label: "Store inventory value",
      value: stats.inventoryValue,
      icon: Package,
      tone: "ink",
    },
    {
      label: "Active borrowers",
      value: stats.activeBorrowers,
      icon: Users2,
      tone: "ink",
      isCount: true,
    },
    {
      label: "Total credit issued",
      value: stats.totalIssued,
      icon: TrendingUp,
      tone: "credit",
    },
  ];

  return (
    <div className="p-5 sm:p-8">
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Dashboard</h1>
      <p className="text-sm text-[var(--color-ink-soft)] mb-8">
        Where the ledger stands this morning.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, tone, isCount }) => (
          <div
            key={label}
            className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</span>
              <Icon size={16} className="text-[var(--color-ink-soft)]" />
            </div>
            <p
              className={`font-mono text-2xl font-semibold animate-stamp ${
                tone === "debit"
                  ? "text-[var(--color-debit)]"
                  : tone === "credit"
                  ? "text-[var(--color-credit)]"
                  : "text-[var(--color-ink)]"
              }`}
            >
              {loading
                ? "…"
                : isCount
                ? value
                : `KSh ${value.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg text-[var(--color-ink)] mb-3">
        Active borrowers
      </h2>
      <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs text-[var(--color-ink-soft)] border-b border-[var(--color-rule)]">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 font-medium text-right">Balance</th>
              <th className="px-5 py-3 font-medium text-right">Due</th>
              <th className="px-5 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[var(--color-ink-soft)]">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && borrowers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[var(--color-ink-soft)]">
                  No active credit right now.
                </td>
              </tr>
            )}
            {borrowers.map((l) => (
              <tr key={l.loan_id} className="border-b border-[var(--color-rule)] last:border-0">
                <td className="px-5 py-3 font-medium">
                  {l.profiles?.first_name} {l.profiles?.last_name}
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                  {l.profiles?.phone || "—"}
                </td>
                <td className="px-5 py-3">{l.item_name}</td>
                <td className="px-5 py-3 text-right font-mono text-[var(--color-debit)]">
                  KSh {Number(l.balance_remaining).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right text-[var(--color-ink-soft)]">
                  {new Date(l.due_date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      l.status === "Overdue"
                        ? "bg-[var(--color-debit)]/15 text-[var(--color-debit)]"
                        : "bg-[var(--color-ochre)]/15 text-[var(--color-ochre-dark)]"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}