import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bus,
  MapPin,
  ShieldCheck,
  Clock,
  Bell,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Navigation,
  Activity,
} from "lucide-react";
import { BusMap } from "@/components/BusMap";
import { stats } from "@/lib/bus-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GGI Bus Tracking System — Smart Campus Transit" },
      { name: "description", content: "Track GGI university buses in real time. Live ETAs, route management, and a premium fleet dashboard for students, drivers, and admins." },
      { property: "og:title", content: "GGI Bus Tracking System" },
      { property: "og:description", content: "Real-time bus tracking, ETAs and fleet management for GGI campus." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <LivePreview />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto mt-3 max-w-7xl px-4">
        <div className="glass flex items-center justify-between rounded-2xl border px-4 py-2.5 shadow-soft">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
              <Bus className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">GGI Transit</div>
              <div className="text-[10px] text-muted-foreground">Smart Bus Platform</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#live" className="hover:text-foreground">Live Map</a>
            <a href="#stats" className="hover:text-foreground">Impact</a>
            <Link to="/admin" className="hover:text-foreground">For Admins</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/student"
              className="hidden rounded-full border bg-card px-4 py-2 text-sm font-semibold shadow-soft transition hover:border-brand hover:text-brand sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <MapPin className="h-4 w-4" /> Track Bus
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-mesh absolute inset-0 -z-10" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> Live · 31 buses moving across Amritsar
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Track every GGI bus,{" "}
            <span className="bg-gradient-brand bg-clip-text text-transparent">in real time.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A premium smart-transport platform for Global Group of Institutes. Live GPS, accurate ETAs,
            driver tools, and an admin command center — built for safety and on-time arrivals.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/track"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <MapPin className="h-4 w-4" /> Track Bus <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-sm font-semibold shadow-soft transition hover:border-brand hover:text-brand"
            >
              Open Admin Dashboard
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 96.4% on-time</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 18 routes covered</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 24/7 GPS tracking</div>
          </div>
        </div>

        <div className="relative">
          <div className="animate-float absolute -left-6 top-6 z-10 hidden rounded-2xl border bg-card p-3 shadow-soft sm:flex sm:items-center sm:gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Next arrival</div>
              <div className="text-sm font-semibold">Express A1 · 4 min</div>
            </div>
          </div>
          <div className="animate-float absolute -bottom-6 -right-4 z-10 hidden rounded-2xl border bg-card p-3 shadow-soft sm:flex sm:items-center sm:gap-3" style={{ animationDelay: "1.2s" }}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Live speed</div>
              <div className="text-sm font-semibold">42 km/h</div>
            </div>
          </div>
          <BusMap className="h-[420px] w-full shadow-glow sm:h-[480px]" />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["GGI Amritsar", "GGI Batala Road", "Golden Temple", "Hall Bazaar", "Ranjit Avenue", "Mall Road", "Verka"];
  return (
    <div className="border-y bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm font-medium text-muted-foreground">
        <span className="text-xs uppercase tracking-widest text-foreground/60">Routes serving</span>
        {items.map((t, index) => (
          <span key={`${t}-${index}`} className="opacity-80">{t}</span>
        ))}
      </div>
    </div>
  );
}

const featureList = [
  { icon: MapPin, title: "Live GPS Tracking", desc: "Sub-second updates on every bus across all routes with replay history." },
  { icon: Clock, title: "Accurate ETAs", desc: "Smart ETAs adjust to traffic, weather and stop dwell times automatically." },
  { icon: Bell, title: "Smart Notifications", desc: "Push alerts for arrivals, delays and route changes — to students and staff." },
  { icon: ShieldCheck, title: "Driver Safety", desc: "Speed, harsh braking and SOS alerts surface in the admin control center." },
  { icon: Smartphone, title: "Mobile First", desc: "Polished, responsive UI built for the way students actually commute." },
  { icon: Navigation, title: "Route Intelligence", desc: "Optimize routes, balance load, and forecast demand with built-in analytics." },
] as const;

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">Platform</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Everything campus transit needs</h2>
        <p className="mt-3 text-muted-foreground">From the bus stop to the boardroom — one premium command center.</p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featureList.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity group-hover:opacity-20" />
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LivePreview() {
  return (
    <section id="live" className="mx-auto max-w-7xl px-4 py-16">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          <div className="relative">
            <BusMap className="h-[420px] w-full rounded-none border-0 lg:h-[520px]" />
          </div>
          <div className="border-t p-6 sm:p-8 lg:border-l lg:border-t-0">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">Live preview</span>
            <h3 className="mt-3 font-display text-2xl font-bold">A control room in your browser</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              See exactly what dispatchers see — a real-time map, ETAs, on-board occupancy and route deviation
              alerts. Beautiful, fast, and built for scale.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Live moving bus markers", "Per-stop ETA accuracy", "Route deviation alerts", "Occupancy & speed telemetry"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex gap-3">
              <Link to="/track" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Open Live Map <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-semibold">Admin View</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const items = [
    { label: "Buses in fleet", value: stats.totalBuses, suffix: "" },
    { label: "Daily students", value: 12400, suffix: "+" },
    { label: "Routes covered", value: stats.routes, suffix: "" },
    { label: "On-time arrivals", value: stats.onTime, suffix: "%" },
  ];
  return (
    <section id="stats" className="mx-auto max-w-7xl px-4 py-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-gradient-to-br from-card to-card/60 p-6 shadow-soft">
            <div className="font-display text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-brand bg-clip-text text-transparent">{s.value.toLocaleString()}</span>
              <span className="text-foreground/80">{s.suffix}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-white shadow-glow sm:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-danger/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Make campus commutes effortless.</h2>
            <p className="mt-3 max-w-xl text-white/80">
              Roll out GGI Transit across every route — students get accurate ETAs, drivers get clear
              instructions, and admins get total visibility.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/track" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand shadow-soft">Track a Bus</Link>
            <Link to="/admin" className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Get Started</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white"><Bus className="h-5 w-5" /></div>
            <div className="font-display font-bold">GGI Transit</div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Smart bus tracking platform for Global Group of Institutes.</p>
        </div>
        <FooterCol title="Product" items={["Live Tracking", "Admin Console", "Driver App", "Student App"]} />
        <FooterCol title="Company" items={["About", "Careers", "Press", "Contact"]} />
        <div>
          <div className="text-sm font-semibold">Contact</div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>GGI Campus, Amritsar, Punjab</li>
            <li>support@ggitransit.in</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} GGI Transit. All rights reserved.</div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {items.map((i) => <li key={i} className="hover:text-foreground"><a href="#">{i}</a></li>)}
      </ul>
    </div>
  );
}
