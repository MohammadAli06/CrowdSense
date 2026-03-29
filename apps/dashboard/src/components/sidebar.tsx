"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href: "/cameras",
    label: "Cameras",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z"/>
        <rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
  {
    href: "/zone-config",
    label: "Zone Config",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Admin User";

  return (
    <aside className="cs-sidebar">
      {/* Logo */}
      <div className="cs-sidebar-logo">
        <Link href="/dashboard">
          <div className="brand">CrowdSense</div>
          <div className="sub">{userName}</div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="cs-sidebar-nav">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cs-nav-item ${active ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="cs-sidebar-footer">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cs-nav-item w-full text-left"
          id="cs-logout-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

/* ─── Dashboard Shell ─────────────────────────────────────────────────── */
export function DashboardShell({
  title,
  topRight,
  statusItems,
  children,
  searchPlaceholder = "Global system search...",
}: {
  title: string;
  topRight?: React.ReactNode;
  statusItems?: { label: string; color?: string }[];
  children: React.ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <div className="cs-layout">
      <Sidebar />
      <main className="cs-main">
        {/* Top bar */}
        <header className="cs-topbar">
          <span className="cs-topbar-title">{title}</span>

          {/* Search */}
          <div className="cs-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a7a8a" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder={searchPlaceholder} />
          </div>

          {topRight}

          {/* Notification bell */}
          <button className="relative p-1.5 text-[#5a7a8a] hover:text-[#00c8d4] transition-colors" id="cs-bell-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00c8d4] border border-[#0d1420]" />
          </button>

          {/* Avatar */}
          <AvatarBadge />
        </header>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {children}
        </motion.div>

        {/* Status bar */}
        {statusItems && (
          <div className="cs-statusbar">
            {statusItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span
                  className="dot"
                  style={{ background: item.color ?? "#10b981" }}
                />
                {item.label}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Avatar badge ────────────────────────────────────────────────────── */
function AvatarBadge() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "AU";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      title={name}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-[#0a0f18] select-none"
      style={{ background: "linear-gradient(135deg, #00c8d4, #0070a8)" }}
    >
      {initials}
    </div>
  );
}
