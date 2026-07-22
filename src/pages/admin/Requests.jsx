import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("credit_requests")
      .select("*, profiles(phone, email)")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(request, decision) {
    setBusyId(request.request_id);

    if (decision === "Approved") {
      // Turn the approved request into an active loan, due in 30 days by default.
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { error: loanErr } = await supabase.from("loans").insert({
        customer_id: request.customer_id,
        item_name: request.item_name,
        principal_amount: request.amount,
        balance_remaining: request.amount,
        due_date: dueDate.toISOString(),
      });
      if (loanErr) {
        alert(loanErr.message);
        setBusyId(null);
        return;
      }
    }

    const { error } = await supabase
      .from("credit_requests")
      .update({ status: decision })
      .eq("request_id", request.request_id);

    if (error) alert(error.message);
    else load();
    setBusyId(null);
  }

  const pending = requests.filter((r) => r.status === "Pending");
  const decided = requests.filter((r) => r.status !== "Pending");

  return (
    <div className="p-5 sm:p-8">
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Requests</h1>
      <p className="text-sm text-[var(--color-ink-soft)] mb-8">
        Credit line applications waiting on a decision.
      </p>

      <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-[var(--color-rule)] text-xs font-medium text-[var(--color-ink-soft)]">
          Pending ({pending.length})
        </div>
        {loading && <p className="px-5 py-6 text-center text-sm text-[var(--color-ink-soft)]">Loading…</p>}
        {!loading && pending.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-[var(--color-ink-soft)]">
            Nothing waiting — the queue is clear.
          </p>
        )}
        {pending.map((r) => (
          <div
            key={r.request_id}
            className="flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-b border-[var(--color-rule)] last:border-0"
          >
            <div>
              <p className="text-sm font-medium">{r.customer_name}</p>
              <p className="text-xs text-[var(--color-ink-soft)]">
                {r.item_name} · KSh {Number(r.amount).toLocaleString()}
                {r.profiles?.phone && <> · {r.profiles.phone}</>}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={busyId === r.request_id}
                onClick={() => handleDecision(r, "Approved")}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[var(--color-credit)] text-white disabled:opacity-60"
              >
                <Check size={14} /> Approve
              </button>
              <button
                disabled={busyId === r.request_id}
                onClick={() => handleDecision(r, "Rejected")}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-[var(--color-rule)] disabled:opacity-60"
              >
                <X size={14} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {decided.length > 0 && (
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg overflow-hidden opacity-80">
          <div className="px-5 py-3 border-b border-[var(--color-rule)] text-xs font-medium text-[var(--color-ink-soft)]">
            Decided
          </div>
          {decided.map((r) => (
            <div
              key={r.request_id}
              className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-rule)] last:border-0 text-sm"
            >
              <span>
                {r.customer_name} · {r.item_name}
              </span>
              <span
                className={
                  r.status === "Approved" ? "text-[var(--color-credit)]" : "text-[var(--color-debit)]"
                }
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}