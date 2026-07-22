import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
        <p className="font-mono text-sm text-[var(--color-ink-soft)]">Opening the ledger…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/portal"} replace />;
  }

  return children;
}