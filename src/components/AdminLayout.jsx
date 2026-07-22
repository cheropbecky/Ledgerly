import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Inbox, Package, BookText, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/requests", label: "Requests", icon: Inbox },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <BookText size={20} className="text-[var(--color-ochre)]" />
        <span className="font-display text-lg">Ledgerly</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-ochre)] text-white"
                  : "text-[var(--color-paper)]/80 hover:bg-white/10"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="px-3 text-xs text-[var(--color-paper)]/60 mb-2">
          {profile?.first_name} {profile?.last_name}
        </p>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--color-paper)]/80 hover:bg-white/10"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="flex items-center gap-2">
          <BookText size={18} className="text-[var(--color-ochre)]" />
          <span className="font-display text-base">Ledgerly</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-[var(--color-ink)] text-[var(--color-paper)] flex-col">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[var(--color-ink)] text-[var(--color-paper)] flex flex-col">
            <button
              onClick={() => setDrawerOpen(false)}
              className="self-end p-4"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {SidebarContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      <main className="flex-1 bg-[var(--color-paper)] overflow-y-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}