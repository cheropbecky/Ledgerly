import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";

const CREDIT_LIMIT = 1000; // KSh — total a customer may owe/have pending at once

export default function CustomerPortal() {
  const { user, profile } = useAuth();
  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [requesting, setRequesting] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const { data: loanData } = await supabase
      .from("loans")
      .select("*")
      .eq("customer_id", user.id)
      .order("issue_date", { ascending: false });

    const loanIds = (loanData || []).map((l) => l.loan_id);
    const { data: repayData } = loanIds.length
      ? await supabase.from("repayments").select("*").in("loan_id", loanIds)
      : { data: [] };

    const { data: pendingData } = await supabase
      .from("credit_requests")
      .select("*")
      .eq("customer_id", user.id)
      .eq("status", "Pending");

    const { data: itemData } = await supabase
      .from("credit_items")
      .select("*")
      .gt("stock_quantity", 0)
      .order("name");

    setLoans(loanData || []);
    setRepayments(repayData || []);
    setPendingRequests(pendingData || []);
    setItems(itemData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const totalOutstanding = loans
    .filter((l) => l.status !== "Paid")
    .reduce((sum, l) => sum + Number(l.balance_remaining), 0);
  const pendingTotal = pendingRequests.reduce((sum, r) => sum + Number(r.amount), 0);
  const currentExposure = totalOutstanding + pendingTotal;
  const activeCredits = loans.filter((l) => l.status !== "Paid").length;

  const timeline = [
    ...loans.map((l) => ({
      type: "credit",
      date: l.issue_date,
      label: l.item_name,
      amount: Number(l.principal_amount),
    })),
    ...repayments.map((r) => ({
      type: "payment",
      date: r.payment_date,
      label: "Payment received",
      amount: Number(r.amount_paid),
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  async function requestItem(item) {
    setRequesting(item.item_id);

    const wouldBeExposure = currentExposure + Number(item.price);
    const overLimit = wouldBeExposure > CREDIT_LIMIT;

    const { error } = await supabase.from("credit_requests").insert({
      customer_id: user.id,
      customer_name: `${profile.first_name} ${profile.last_name}`,
      item_name: item.name,
      amount: item.price,
      status: overLimit ? "Rejected" : "Pending",
    });

    if (error) {
      alert(error.message);
    } else if (overLimit) {
      alert(
        `Request for ${item.name} was automatically declined: it would put your total credit at KSh ${wouldBeExposure.toLocaleString()}, over the KSh ${CREDIT_LIMIT.toLocaleString()} limit.`
      );
      loadAll();
    } else {
      alert(`Request sent for ${item.name}. The shop will review it shortly.`);
      loadAll();
    }
    setRequesting(null);
  }

  const remainingCredit = Math.max(0, CREDIT_LIMIT - currentExposure);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Balance banner */}
      <div className="bg-[var(--color-ink)] text-[var(--color-paper)] rounded-xl p-5 sm:p-6 mb-8">
        <p className="text-xs text-[var(--color-paper)]/70 mb-1">Total outstanding balance</p>
        <p className="font-mono text-3xl sm:text-4xl font-semibold animate-stamp mb-4">
          KSh {totalOutstanding.toLocaleString("en-KE")}
        </p>
        <div className="flex items-center gap-2 text-sm text-[var(--color-paper)]/80 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ochre)]" />
          {activeCredits} active credit{activeCredits === 1 ? "" : "s"} taken
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-paper)]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-paper)]/40" />
          KSh {remainingCredit.toLocaleString("en-KE")} credit room left (limit KSh{" "}
          {CREDIT_LIMIT.toLocaleString("en-KE")})
        </div>
      </div>

      {/* Store catalog — one-tap purchase */}
      <section className="mb-8">
        <h2 className="font-display text-lg text-[var(--color-ink)] mb-3">Available on credit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.item_id}
              className="flex items-center justify-between bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-[var(--color-ink-soft)] font-mono">
                  KSh {Number(item.price).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => requestItem(item)}
                disabled={requesting === item.item_id}
                className="text-xs px-3 py-1.5 rounded-md bg-[var(--color-ochre)] text-white disabled:opacity-60"
              >
                {requesting === item.item_id ? "Sending…" : "Get"}
              </button>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-[var(--color-ink-soft)]">Nothing in stock right now.</p>
          )}
        </div>
      </section>

      {/* Unified ledger history */}
      <section>
        <h2 className="font-display text-lg text-[var(--color-ink)] mb-3">History</h2>
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg ledger-lines">
          {timeline.length === 0 && !loading && (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-soft)]">No activity yet.</p>
          )}
          {timeline.map((entry, i) => (
            <div key={i} className="flex items-center justify-between px-5 h-[43px] text-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-ink-soft)] w-20 shrink-0">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span>{entry.label}</span>
              </div>
              <span
                className={`font-mono ${
                  entry.type === "credit" ? "text-[var(--color-debit)]" : "text-[var(--color-credit)]"
                }`}
              >
                {entry.type === "credit" ? "+" : "−"} KSh {entry.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}