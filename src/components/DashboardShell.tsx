import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  Bus,
  Bell,
  Settings,
  GraduationCap,
  Search,
  Menu,
  Sun,
  Moon,
  CircleUserRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/track", label: "Live Tracking", icon: Map },
  { to: "/student", label: "Student", icon: GraduationCap },
  { to: "/driver", label: "Driver", icon: CircleUserRound },
] as const;

export function DashboardShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sidebar-foreground">
            <Bus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-bold leading-tight">GGI Transit</div>
            <div className="truncate text-[11px] text-sidebar-foreground/70">Smart Bus Platform</div>
          </div>
        </div>
        <nav className="mt-2 space-y-0.5 px-3">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-white/15 text-sidebar-primary shadow-inner"
                    : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-white")} />
                <span className="truncate">{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-3 bottom-4 rounded-xl bg-white/10 p-3">
          <div className="text-xs font-semibold">System health</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-sidebar-foreground/80">
            <span>Fleet uptime</span>
            <span className="font-semibold text-success">99.4%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-success to-emerald-300" />
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-semibold sm:text-xl">{title}</h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-soft">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search bus, route, driver…"
                  className="w-56 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-full border bg-card p-2 shadow-soft transition hover:text-brand"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="relative rounded-full border bg-card p-2 shadow-soft hover:text-brand" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
            </button>
            <button className="rounded-full border bg-card p-2 shadow-soft hover:text-brand" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </button>
            <div className="ml-1 flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 shadow-soft">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-brand text-xs font-semibold text-white">AD</div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-none">Admin</div>
                <div className="text-[10px] text-muted-foreground">GGI Transit</div>
              </div>
            </div>
            {actions}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}