import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loansByCustomer, setLoansByCustomer] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'credit'|'payment', customerId, loanId? }
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("first_name");

    const { data: loans } = await supabase
      .from("loans")
      .select("*")
      .order("issue_date", { ascending: false });

    const grouped = {};
    (loans || []).forEach((l) => {
      grouped[l.customer_id] = grouped[l.customer_id] || [];
      grouped[l.customer_id].push(l);
    });

    setCustomers(profiles || []);
    setLoansByCustomer(grouped);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function balanceFor(customerId) {
    return (loansByCustomer[customerId] || [])
      .filter((l) => l.status !== "Paid")
      .reduce((sum, l) => sum + Number(l.balance_remaining), 0);
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">Customers</h1>
      </div>
      <p className="text-sm text-[var(--color-ink-soft)] mb-8">
        Every account's debt position, at a glance.
      </p>

      <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs text-[var(--color-ink-soft)] border-b border-[var(--color-rule)]">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium text-right">Outstanding balance</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-[var(--color-ink-soft)]">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-[var(--color-ink-soft)]">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((c) => {
              const bal = balanceFor(c.id);
              const isOpen = expanded === c.id;
              return (
                <>
                  <tr
                    key={c.id}
                    className="border-b border-[var(--color-rule)] last:border-0 hover:bg-black/[0.02] cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                  >
                    <td className="px-5 py-3 font-medium">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-ink-soft)]">{c.phone || "—"}</td>
                    <td
                      className={`px-5 py-3 text-right font-mono ${
                        bal > 0 ? "text-[var(--color-debit)]" : "text-[var(--color-credit)]"
                      }`}
                    >
                      KSh {bal.toLocaleString("en-KE")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ type: "credit", customerId: c.id });
                          }}
                          className="text-xs px-2.5 py-1 rounded border border-[var(--color-rule)] hover:border-[var(--color-ochre)]"
                        >
                          Log credit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ type: "payment", customerId: c.id });
                          }}
                          className="text-xs px-2.5 py-1 rounded bg-[var(--color-credit)] text-white hover:opacity-90"
                        >
                          Log payment
                        </button>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={4} className="px-5 pb-4 bg-black/[0.015]">
                        <LoanHistory loans={loansByCustomer[c.id] || []} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <ActionModal
          modal={modal}
          customer={customers.find((c) => c.id === modal.customerId)}
          loans={loansByCustomer[modal.customerId] || []}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadAll();
          }}
        />
      )}
    </div>
  );
}

function LoanHistory({ loans }) {
  if (loans.length === 0) {
    return <p className="text-xs text-[var(--color-ink-soft)] py-2">No credit history yet.</p>;
  }
  return (
    <table className="w-full text-xs mt-2">
      <thead>
        <tr className="text-left text-[var(--color-ink-soft)]">
          <th className="py-1 font-medium">Item</th>
          <th className="py-1 font-medium text-right">Principal</th>
          <th className="py-1 font-medium text-right">Balance</th>
          <th className="py-1 font-medium text-right">Status</th>
          <th className="py-1 font-medium text-right">Due</th>
        </tr>
      </thead>
      <tbody>
        {loans.map((l) => (
          <tr key={l.loan_id} className="border-t border-[var(--color-rule)]">
            <td className="py-1.5">{l.item_name}</td>
            <td className="py-1.5 text-right font-mono">KSh {Number(l.principal_amount).toLocaleString()}</td>
            <td className="py-1.5 text-right font-mono">KSh {Number(l.balance_remaining).toLocaleString()}</td>
            <td className="py-1.5 text-right">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  l.status === "Paid"
                    ? "bg-[var(--color-credit)]/15 text-[var(--color-credit)]"
                    : l.status === "Overdue"
                    ? "bg-[var(--color-debit)]/15 text-[var(--color-debit)]"
                    : "bg-[var(--color-ochre)]/15 text-[var(--color-ochre-dark)]"
                }`}
              >
                {l.status}
              </span>
            </td>
            <td className="py-1.5 text-right text-[var(--color-ink-soft)]">
              {new Date(l.due_date).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ActionModal({ modal, customer, loans, onClose, onSaved }) {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loanId, setLoanId] = useState(loans.find((l) => l.status !== "Paid")?.loan_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openLoans = loans.filter((l) => l.status !== "Paid");

  async function handleSave() {
    setSaving(true);
    setError("");

    if (modal.type === "credit") {
      const { error } = await supabase.from("loans").insert({
        customer_id: modal.customerId,
        item_name: itemName,
        principal_amount: Number(amount),
        balance_remaining: Number(amount),
        due_date: dueDate,
      });
      if (error) setError(error.message);
      else onSaved();
    } else {
      if (!loanId) {
        setError("Select which credit line this payment applies to.");
        setSaving(false);
        return;
      }
      const loan = loans.find((l) => l.loan_id === loanId);
      const paid = Number(amount);
      const newBalance = Math.max(0, Number(loan.balance_remaining) - paid);

      const { error: repayErr } = await supabase.from("repayments").insert({
        loan_id: loanId,
        amount_paid: paid,
      });
      if (repayErr) {
        setError(repayErr.message);
        setSaving(false);
        return;
      }

      const { error: loanErr } = await supabase
        .from("loans")
        .update({
          balance_remaining: newBalance,
          status: newBalance === 0 ? "Paid" : loan.status,
        })
        .eq("loan_id", loanId);

      if (loanErr) setError(loanErr.message);
      else onSaved();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-paper-card)] rounded-lg w-full max-w-sm p-6 border border-[var(--color-rule)]">
        <h2 className="font-display text-lg text-[var(--color-ink)] mb-1">
          {modal.type === "credit" ? "Log new credit" : "Log payment"}
        </h2>
        <p className="text-xs text-[var(--color-ink-soft)] mb-4">
          {customer?.first_name} {customer?.last_name}
        </p>

        <div className="space-y-3">
          {modal.type === "credit" ? (
            <>
              <input
                placeholder="Item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Amount (KSh)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </>
          ) : (
            <>
              <select value={loanId} onChange={(e) => setLoanId(e.target.value)} className="input">
                <option value="">Select credit line…</option>
                {openLoans.map((l) => (
                  <option key={l.loan_id} value={l.loan_id}>
                    {l.item_name} — KSh {Number(l.balance_remaining).toLocaleString()} owed
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount paid (KSh)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
            </>
          )}
        </div>

        {error && <p className="text-xs text-[var(--color-debit)] mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md border border-[var(--color-rule)] text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-md bg-[var(--color-ochre)] text-white text-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-rule);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: white;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}