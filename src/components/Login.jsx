import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookText, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "signin") {
      const { error } = await signIn({ email: form.email, password: form.password });
      if (error) setError(error.message);
      else navigate("/redirect");
    } else {
      const { error } = await signUp({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        role: "customer",
      });
      if (error) setError(error.message);
      else {
        setError("");
        setMode("signin");
        setForm((f) => ({ ...f, password: "" }));
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[var(--color-ink)] flex items-center justify-center mb-3">
            <BookText size={22} className="text-[var(--color-paper)]" />
          </div>
          <h1 className="font-display text-3xl text-[var(--color-ink)]">Ledgerly</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Store credit, kept honest.</p>
        </div>

        <div className="bg-[var(--color-paper-card)] border border-[var(--color-rule)] rounded-lg shadow-sm p-6">
          {/* toggle */}
          <div className="flex rounded-md border border-[var(--color-rule)] overflow-hidden mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 transition-colors ${
                mode === "signin"
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "bg-transparent text-[var(--color-ink-soft)]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 transition-colors ${
                mode === "signup"
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "bg-transparent text-[var(--color-ink-soft)]"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <input
                    required
                    value={form.firstName}
                    onChange={update("firstName")}
                    className="input"
                  />
                </Field>
                <Field label="Last name">
                  <input
                    required
                    value={form.lastName}
                    onChange={update("lastName")}
                    className="input"
                  />
                </Field>
              </div>
            )}

            <Field label="Email">
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="input"
              />
            </Field>

            {mode === "signup" && (
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="07xx xxx xxx"
                  className="input"
                />
              </Field>
            )}

            <Field label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update("password")}
                className="input"
              />
            </Field>

            {error && (
              <p className="text-sm text-[var(--color-debit)] bg-[var(--color-debit)]/10 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-ochre)] hover:bg-[var(--color-ochre-dark)] text-white font-medium rounded-md py-2.5 transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-xs text-[var(--color-ink-soft)] mt-4 text-center">
              New accounts are created as customers. Admin access is granted directly in
              Supabase.
            </p>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-rule);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: white;
          font-size: 0.9rem;
        }
        .input:focus { border-color: var(--color-ochre); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--color-ink-soft)] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}