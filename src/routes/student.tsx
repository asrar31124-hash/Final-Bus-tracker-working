import { createFileRoute } from "@tanstack/react-router";
import { Bus, Clock, MapPin, Bell, Heart, QrCode, Star } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { BusMap } from "@/components/BusMap";
import { buses, notifications } from "@/lib/bus-data";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student Dashboard · GGI Transit" }] }),
  component: StudentPage,
});

function StudentPage() {
  const myBus = buses[1];
  return (
    <DashboardShell title="Hi, Aditi 👋" subtitle="Your daily commute, at a glance">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
            <div className="grid lg:grid-cols-[1fr_1.2fr]">
              <div className="bg-gradient-brand p-6 text-white">
                <div className="text-xs uppercase tracking-widest text-white/70">Your bus</div>
                <div className="mt-1 font-display text-2xl font-extrabold">{myBus.id} · {myBus.name}</div>
                <div className="mt-1 text-sm text-white/80">{myBus.route}</div>
                <div className="mt-6 flex items-end gap-3">
                  <div className="font-display text-5xl font-extrabold leading-none">{myBus.eta.split(" ")[0]}</div>
                  <div className="pb-1 text-sm text-white/80">{myBus.eta.split(" ")[1] ?? ""} to Gate 3</div>
                </div>
                <div className="mt-6 flex items-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Next: {myBus.nextStop}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 38 km/h</span>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand shadow-soft">
                  <MapPin className="h-4 w-4" /> Track on map
                </button>
              </div>
              <BusMap className="h-full min-h-[280px] rounded-none border-0 lg:border-l" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SmallCard icon={Bus} label="Trips this week" value="12" />
            <SmallCard icon={Clock} label="Hours saved" value="3.4h" />
            <SmallCard icon={Star} label="On-time rate" value="98%" />
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-base font-semibold">Saved buses</div>
              <button className="text-xs font-medium text-brand">Manage</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {buses.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand"><Bus className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm font-semibold">{b.id}</div>
                      <div className="text-xs text-muted-foreground">{b.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{b.eta}</div>
                    <button className="text-[11px] text-danger"><Heart className="inline h-3 w-3 fill-current" /> Saved</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 text-center shadow-soft">
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background">
              <QrCode className="h-16 w-16" />
            </div>
            <div className="mt-4 font-display text-sm font-semibold">Boarding pass</div>
            <div className="text-xs text-muted-foreground">Scan at the bus door</div>
            <div className="mt-3 rounded-lg bg-muted/50 px-3 py-1.5 font-mono text-xs">GGI-2024-1834</div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-sm font-semibold">Notifications</div>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id} className="rounded-xl border bg-background p-3">
                  <div className="text-xs font-semibold">{n.title}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

function SmallCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <Icon className="h-5 w-5 text-brand" />
      <div className="mt-3 font-display text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}