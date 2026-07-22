import { Outlet } from "react-router-dom";
import { BookText, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function CustomerLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-paper-card)]">
        <div className="flex items-center gap-2">
          <BookText size={20} className="text-[var(--color-ochre)]" />
          <span className="font-display text-lg text-[var(--color-ink)]">Ledgerly</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-ink-soft)] hidden sm:block">
            {profile?.first_name} {profile?.last_name}
          </span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}