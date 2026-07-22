import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const empty = { name: "", price: "", stock_quantity: "" };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding new
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("credit_items").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      price: item.price,
      stock_quantity: item.stock_quantity,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || form.price === "" || form.stock_quantity === "") {
      setError("Fill in all fields.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
    };

    const { error } = editing
      ? await supabase.from("credit_items").update(payload).eq("item_id", editing.item_id)
      : await supabase.from("credit_items").insert(payload);

    if (error) setError(error.message);
    else {
      setModalOpen(false);
      load();
    }
    setSaving(false);
  }

  async function handleDelete(item) {
    if (!confirm(`Remove "${item.name}" from the credit catalog?`)) return;
    const { error } = await supabase.from("credit_items").delete().eq("item_id", item.item_id);
    if (error) alert(error.message);
    else load();
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">Inventory</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-md bg-[var(--color-ochre)] text-white hover:bg-[var(--color-ochre-dark)]"
        >
          <Plus size={16} /> Add item
        </button>
      </div>
      <p className="text-sm text-[var(--color-ink-soft)] mb-8">
        Items customers can take on credit. Changes here show up in the customer portal
        immediately.
      </p>

      <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-xs text-[var(--color-ink-soft)] border-b border-[var(--color-rule)]">
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 font-medium text-right">Price</th>
              <th className="px-5 py-3 font-medium text-right">Stock</th>
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
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-[var(--color-ink-soft)]">
                  No items yet — add your first one.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item.item_id}
                className="border-b border-[var(--color-rule)] last:border-0"
              >
                <td className="px-5 py-3 font-medium">{item.name}</td>
                <td className="px-5 py-3 text-right font-mono">
                  KSh {Number(item.price).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-mono">{item.stock_quantity}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded border border-[var(--color-rule)] hover:border-[var(--color-ochre)]"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded border border-[var(--color-rule)] hover:border-[var(--color-debit)] hover:text-[var(--color-debit)]"
                      aria-label="Delete"
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-[var(--color-paper-card)] rounded-lg w-full max-w-sm p-6 border border-[var(--color-rule)]">
            <h2 className="font-display text-lg text-[var(--color-ink)] mb-4">
              {editing ? "Edit item" : "Add item"}
            </h2>

            <div className="space-y-3">
              <input
                placeholder="Item name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="modal-input"
              />
              <input
                type="number"
                placeholder="Price (KSh)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="modal-input"
              />
              <input
                type="number"
                placeholder="Stock quantity"
                value={form.stock_quantity}
                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                className="modal-input"
              />
            </div>

            {error && <p className="text-xs text-[var(--color-debit)] mt-3">{error}</p>}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModalOpen(false)}
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
            .modal-input {
              width: 100%;
              border: 1px solid var(--color-rule);
              border-radius: 0.375rem;
              padding: 0.5rem 0.75rem;
              background: white;
              font-size: 0.875rem;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}