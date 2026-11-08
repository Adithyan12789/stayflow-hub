import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Globe2,
  Headphones,
  Home as HomeIcon,
  Layers3,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

const channels = ["airbnb", "Booking.com", "makemytrip", "goibibo", "agoda", "vrbo"];

const features = [
  {
    icon: CalendarDays,
    label: "Unified Calendar",
    title: "Every booking. One calm view.",
    body: "See OTA, direct, walk-in, and offline reservations in one live calendar. No tabs. No conflicts.",
    accent: "bg-[#e9f6ef] text-[#1f7b52]",
  },
  {
    icon: Globe2,
    label: "Direct Bookings",
    title: "Keep more of every stay.",
    body: "Launch a beautiful booking website with online payments and zero commission on your direct revenue.",
    accent: "bg-[#fff1e6] text-[#bc5b19]",
  },
  {
    icon: Zap,
    label: "Channel Manager",
    title: "One update. Every channel.",
    body: "Sync rates, availability, and reservations across your connected OTAs in real time.",
    accent: "bg-[#eeeaff] text-[#6049b6]",
  },
  {
    icon: BarChart3,
    label: "Profit Analytics",
    title: "Know what truly pays.",
    body: "Track revenue, occupancy, expenses, and margins across every property from one dashboard.",
    accent: "bg-[#eaf4ff] text-[#3277b8]",
  },
];

const soloFeatures = [
  "Unified calendar & channel manager",
  "Direct bookings & professional invoicing",
  "Expense tracking & business insights",
];

const proFeatures = [
  "Magic Cluster multi-configuration properties",
  "Flexi Pricing bulk price updates",
  "Portfolio analytics & profit tracking",
];

const testimonials = [
  {
    quote: "stayzen gave us back our evenings. I can see every booking, every expense, and every open night without opening five different tabs.",
    name: "Ananya Mehta",
    role: "Owner, Cedar & Stone Stays",
    initials: "AM",
  },
  {
    quote: "We went from spreadsheets to a proper operating system for our portfolio. The direct booking site paid for itself in the first month.",
    name: "Rohan Khanna",
    role: "Managing partner, Northstar Retreats",
    initials: "RK",
  },
];

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#234d3d] shadow-[0_8px_18px_rgba(35,77,61,0.18)]">
        <div className="absolute left-[9px] top-[10px] h-[10px] w-[10px] rotate-45 rounded-[2px] bg-[#d5f0dc]" />
        <div className="absolute bottom-[8px] right-[8px] h-[12px] w-[12px] rotate-45 rounded-[2px] bg-[#9ad5ac]" />
      </div>
      {!compact && <span className="text-[17px] font-bold tracking-[-0.04em] text-[#234d3d]">stayzen</span>}
    </div>
  );
}

function MiniCalendar() {
  const bookings = [
    { name: "Hilltop Villa", channel: "Booking.com", start: 1, span: 3, color: "bg-[#8ed0a7]" },
    { name: "Cedar Cottage", channel: "Direct", start: 5, span: 2, color: "bg-[#f3bd82]" },
    { name: "Lakehouse 02", channel: "Airbnb", start: 7, span: 3, color: "bg-[#b5a7ed]" },
    { name: "The Fern Room", channel: "Direct", start: 3, span: 2, color: "bg-[#f0a2a2]" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#f7faf8]/[0.08] shadow-[0_24px_65px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a8c7b3]">Unified calendar</p>
          <p className="mt-1 text-sm font-medium text-white">September 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-white/10 p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white" aria-label="Previous month"><ChevronLeft size={14} /></button>
          <button className="rounded-lg border border-white/10 p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white" aria-label="Next month"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-[112px_repeat(7,minmax(45px,1fr))] text-[10px] text-white/45">
        <div className="border-b border-r border-white/10 px-4 py-3">Property</div>
        {["Mon 7", "Tue 8", "Wed 9", "Thu 10", "Fri 11", "Sat 12", "Sun 13"].map((day) => (
          <div key={day} className="border-b border-r border-white/10 px-2 py-3 text-center last:border-r-0">{day}</div>
        ))}
        {bookings.map((booking) => (
          <div key={booking.name} className="contents">
            <div className="border-b border-r border-white/10 px-4 py-4 text-[11px] font-medium text-white/75">{booking.name}</div>
            <div className="relative col-span-7 border-b border-white/10">
              <div className="absolute inset-0 grid grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => <div key={index} className="border-r border-white/10 last:border-r-0" />)}
              </div>
              <div className={`absolute top-2.5 flex h-8 items-center rounded-lg ${booking.color} px-3 text-[10px] font-semibold text-[#234d3d] shadow-sm`} style={{ left: `calc(${(booking.start - 1) * 14.28}% + 5px)`, width: `calc(${booking.span * 14.28}% - 10px)` }}>
                <span className="truncate">{booking.channel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[10px] text-white/45">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#8ed0a7]" /> Confirmed</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f3bd82]" /> Direct booking</span>
        <span>12 stays this week</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"solo" | "pro">("solo");
  const [annual, setAnnual] = useState(false);
  const [listings, setListings] = useState(1);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [toast, setToast] = useState("");
  const { user, isAuthenticated } = useAuth();
  const isHost = user?.role === "admin";
  const savedAvatar = window.localStorage.getItem("stayzen:profile-avatar") || "";
  const savedName = window.localStorage.getItem("stayzen:profile-name") || "";
  const profileInitials = (savedName || user?.name || user?.email || "Guest").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const pricing = useMemo(() => {
    const monthly = listings <= 1 ? 899 : listings <= 5 ? 749 : listings <= 10 ? 649 : 549;
    return annual ? Math.round(monthly * 0.8) : monthly;
  }, [annual, listings]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfcf9] text-[#234d3d]">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#234d3d] px-5 py-3 text-sm font-semibold text-white shadow-2xl" role="status">
          {toast}
        </div>
      )}

      <div className="bg-[#234d3d] px-4 py-2 text-center text-[11px] font-medium tracking-[0.02em] text-[#e6f6e8]">
        <span className="mr-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-[#9ad5ac]" />
        New: direct booking websites now include WhatsApp guest notifications <button onClick={() => showToast("Feature details coming right up.")} className="ml-2 font-bold underline decoration-[#9ad5ac] underline-offset-4">See what’s new</button>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#dfe9e0]/80 bg-[#fbfcf9]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <a href="#top" aria-label="stayzen home"><LogoMark /></a>
          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#61736a] lg:flex">
            <a href="#features" className="transition hover:text-[#234d3d]">Features</a>
            <a href="#workflow" className="transition hover:text-[#234d3d]">How it works</a>
            <a href="#pricing" className="transition hover:text-[#234d3d]">Pricing</a>
            <a href="#stories" className="transition hover:text-[#234d3d]">Stories</a>{isHost && <a href="/dashboard" className="transition hover:text-[#234d3d]">Host dashboard</a>}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {isHost ? <button onClick={() => { window.location.href = "/dashboard"; }} className="flex items-center gap-2 rounded-full bg-[#f0f6ef] py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-[#234d3d] transition hover:bg-[#e5f1e5]"><span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#234d3d] text-[10px] font-bold text-[#d5f0dc]">{savedAvatar ? <img src={savedAvatar} alt="Profile avatar" className="h-full w-full object-cover" /> : profileInitials}</span>Host dashboard</button> : isAuthenticated ? <button onClick={() => { window.location.href = "/profile"; }} className="flex items-center gap-2 rounded-full bg-[#f0f6ef] py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-[#234d3d] transition hover:bg-[#e5f1e5]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#234d3d] text-[10px] font-bold text-[#d5f0dc]">{profileInitials}</span>Profile</button> : <button onClick={() => { window.location.href = "/login"; }} className="px-3 py-2 text-[13px] font-semibold text-[#234d3d] transition hover:text-[#5d846d]">Log in</button>}
            <button onClick={() => { window.location.href = "/stay"; }} className="rounded-full bg-[#234d3d] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(35,77,61,0.16)] transition hover:-translate-y-0.5 hover:bg-[#2f654f] active:scale-[0.98]">Book our stay <ArrowRight className="ml-1 inline-block" size={14} /></button>
          </div>
          <button className="rounded-xl border border-[#dfe9e0] p-2 lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
        </div>
        {mobileNavOpen && (
          <div className="absolute left-0 right-0 top-[74px] border-b border-[#dfe9e0] bg-[#fbfcf9] px-5 py-5 shadow-xl lg:hidden">
            <div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#98a99f]">Navigate</span><button onClick={closeMobileNav} aria-label="Close navigation"><X size={19} /></button></div>
            <div className="grid gap-1 text-lg font-semibold"><a onClick={closeMobileNav} href="#features" className="rounded-lg px-2 py-3 hover:bg-[#eef6ee]">Features</a><a onClick={closeMobileNav} href="#workflow" className="rounded-lg px-2 py-3 hover:bg-[#eef6ee]">How it works</a><a onClick={closeMobileNav} href="#pricing" className="rounded-lg px-2 py-3 hover:bg-[#eef6ee]">Pricing</a><a onClick={closeMobileNav} href="#stories" className="rounded-lg px-2 py-3 hover:bg-[#eef6ee]">Stories</a>{isHost ? <a onClick={closeMobileNav} href="/dashboard" className="rounded-lg px-2 py-3 text-[#4f8b5e] hover:bg-[#eef6ee]">Host dashboard</a> : isAuthenticated ? <a onClick={closeMobileNav} href="/profile" className="rounded-lg px-2 py-3 text-[#4f8b5e] hover:bg-[#eef6ee]">Profile</a> : <a onClick={closeMobileNav} href="/login" className="rounded-lg px-2 py-3 text-[#4f8b5e] hover:bg-[#eef6ee]">Log in</a>}</div>
            <button onClick={() => { closeMobileNav(); window.location.href = "/stay"; }} className="mt-4 w-full rounded-full bg-[#234d3d] py-3 font-bold text-white">Book our stay <ArrowRight className="ml-1 inline-block" size={15} /></button>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative isolate overflow-hidden pb-20 pt-16 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#e6f4e7] blur-3xl" />
          <div className="pointer-events-none absolute -right-44 top-0 -z-10 h-[520px] w-[520px] rounded-full bg-[#f7eee4] blur-3xl" />
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 lg:px-8">
            <div className="max-w-[590px]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dcebdd] bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5b8a6c] shadow-sm"><Sparkles size={13} /> Built for better hosting</div>
              <h1 className="max-w-[570px] text-[48px] font-semibold leading-[0.98] tracking-[-0.065em] text-[#234d3d] sm:text-[66px] lg:text-[76px]">Your stay business, <span className="text-[#7db487]">flowing.</span></h1>
              <p className="mt-7 max-w-[505px] text-[17px] leading-8 text-[#667970] sm:text-[18px]">stayzen brings calendars, bookings, pricing, payments, and guest communication into one beautifully simple operating system.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={() => { window.location.href = "/stay"; }} className="group rounded-full bg-[#234d3d] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_25px_rgba(35,77,61,0.18)] transition hover:-translate-y-1 hover:bg-[#2f654f] active:scale-[0.98]">Book our stay <ArrowRight className="ml-2 inline-block transition group-hover:translate-x-1" size={16} /></button>
                <button onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })} className="group inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-[#234d3d] transition hover:text-[#7b9f83]"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfe1d2] bg-white"><Play size={12} fill="currentColor" /></span> See how it works</button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-xs text-[#7f9187]"><div className="flex text-[#d49b43]"><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /></div><span><strong className="text-[#234d3d]">4.9/5</strong> from hosts who chose calm</span></div>
            </div>

            <div className="relative min-h-[430px] lg:min-h-[510px]">
              <div className="absolute right-0 top-1/2 h-[375px] w-[calc(100%-10px)] -translate-y-1/2 overflow-hidden rounded-[28px] bg-[#dbeadd] shadow-[0_30px_80px_rgba(35,77,61,0.12)] sm:h-[450px] lg:h-[500px]">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85" alt="Sunlit modern vacation home" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#234d3d]/25 via-transparent to-white/10" />
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/45 bg-white/80 p-4 shadow-xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:w-[270px]">
                  <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#809287]">Live portfolio</p><p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#234d3d]">12 properties</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f4e9] text-[#4f9465]"><Building2 size={18} /></div></div>
                  <div className="mt-4 flex items-end gap-1"><span className="text-[27px] font-semibold tracking-[-0.06em] text-[#234d3d]">₹6.8L</span><span className="pb-1 text-xs text-[#7e9085]">revenue this month</span></div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#deeadf]"><div className="h-full w-[74%] rounded-full bg-[#71b480]" /></div><p className="mt-2 text-[10px] font-medium text-[#72867a]">74% occupancy <span className="float-right text-[#4c9860]">+12.4%</span></p>
                </div>
              </div>
              <div className="absolute -left-1 top-7 w-[176px] rounded-2xl border border-white bg-white/95 p-3.5 shadow-[0_20px_40px_rgba(35,77,61,0.14)] sm:left-0 sm:top-10"><div className="flex items-start justify-between"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e9f6ef] text-[#3b9963]"><CircleDollarSign size={16} /></div><span className="rounded-full bg-[#ecf8ef] px-2 py-1 text-[9px] font-bold text-[#43925b]">+18.6%</span></div><p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b9b91]">Direct revenue</p><p className="mt-1 text-2xl font-semibold tracking-[-0.06em] text-[#234d3d]">₹2.4L</p><p className="mt-1 text-[10px] text-[#829389]">this month</p></div>
              <div className="absolute -bottom-1 right-0 w-[202px] rounded-2xl border border-white bg-white/95 p-3.5 shadow-[0_20px_40px_rgba(35,77,61,0.14)] sm:-right-2 sm:bottom-7"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3e9df] text-[#b96c32]"><BellRing size={15} /></div><div><p className="text-[11px] font-bold text-[#234d3d]">New booking</p><p className="text-[10px] text-[#88998f]">Cedar Cottage · 2 nights</p></div></div><div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-[#4e8e5d]"><Check size={13} /> guest notification sent</div></div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#e5eee5] bg-white/60 py-7">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-9 gap-y-4 px-5 text-[12px] font-bold tracking-[-0.02em] text-[#a0afa5] grayscale sm:justify-between lg:px-8">
            <span className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b2beb6] sm:w-auto sm:text-left">Connected to the tools you already use</span>
            {channels.map((channel) => <span key={channel} className="text-[13px] sm:text-[14px]">{channel}</span>)}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 px-5 py-24 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <div className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div><p className="eyebrow">One workspace, less busywork</p><h2 className="section-title mt-4">We understand what <span className="text-[#7db487]">hosting</span> really needs.</h2></div>
              <div className="flex items-end justify-between gap-6"><p className="max-w-[430px] text-[16px] leading-7 text-[#72847a]">From your first listing to your hundredth, stayzen replaces scattered tools with a clear, connected way to run the business.</p><a href="#workflow" className="hidden shrink-0 items-center gap-2 text-sm font-bold text-[#356c4b] sm:inline-flex">Explore the platform <ArrowUpRight size={16} /></a></div>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => { const Icon = feature.icon; return <article key={feature.label} className="group rounded-[22px] border border-[#e4ece4] bg-white p-6 shadow-[0_12px_30px_rgba(35,77,61,0.035)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(35,77,61,0.08)]"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${feature.accent}`}><Icon size={20} /></div><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-[#91a197]">{feature.label}</p><h3 className="mt-2 text-[20px] font-semibold leading-tight tracking-[-0.04em] text-[#234d3d]">{feature.title}</h3><p className="mt-3 text-[13px] leading-6 text-[#7a8b80]">{feature.body}</p><a href="#workflow" className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#4f8c61]">Learn more <ArrowRight size={13} className="transition group-hover:translate-x-1" /></a></article>; })}
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 overflow-hidden bg-[#234d3d] px-5 py-24 text-white sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div><p className="eyebrow text-[#9ccaa5]">The control center</p><h2 className="section-title mt-4 text-white">One calendar. <span className="text-[#9ad5ac]">Complete control.</span></h2><p className="mt-6 max-w-[430px] text-[16px] leading-8 text-[#bfd2c2]">Every booking, every property, and every channel—finally in one place. Stay on top of the details without living inside your inbox.</p><div className="mt-9 grid gap-4 text-sm text-[#e0eee2]"><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#a8ddb1]"><Check size={14} /></span> Real-time sync across all channels</div><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#a8ddb1]"><Check size={14} /></span> Prevent double bookings automatically</div><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#a8ddb1]"><Check size={14} /></span> See your whole portfolio in one glance</div></div><button onClick={() => showToast("A guided walkthrough request is ready to connect.")} className="mt-10 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15 active:scale-[0.98]">See the full calendar <ArrowRight className="ml-2 inline-block" size={15} /></button></div>
            <div className="relative"><div className="absolute -inset-8 rounded-[50%] bg-[#9ad5ac]/10 blur-3xl" /><MiniCalendar /></div>
          </div>
        </section>

        <section className="px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ value: "28%", label: "average revenue growth", detail: "in the first 120 days" }, { value: "40+", label: "hours saved every month", detail: "on calendar management" }, { value: "2.5×", label: "more direct revenue", detail: "within the first year" }, { value: "₹0", label: "commission on direct bookings", detail: "keep what you earn" }].map((stat) => <div key={stat.value} className="rounded-[22px] border border-[#e4ece4] bg-white p-6"><p className="text-[38px] font-semibold tracking-[-0.07em] text-[#234d3d]">{stat.value}</p><p className="mt-2 text-[13px] font-bold text-[#496754]">{stat.label}</p><p className="mt-1 text-[12px] text-[#91a097]">{stat.detail}</p></div>)}
          </div>
        </section>

        <section className="bg-[#f0f6ef] px-5 py-24 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <div className="text-center"><p className="eyebrow">Built for your next chapter</p><h2 className="section-title mx-auto mt-4 max-w-[650px]">Whether you manage one stay or <span className="text-[#7db487]">one thousand.</span></h2><p className="mx-auto mt-5 max-w-[570px] text-[16px] leading-7 text-[#72847a]">Start with the essentials, then unlock the power to scale without adding another layer of complexity.</p></div>
            <div className="mx-auto mt-12 flex w-fit rounded-full border border-[#d6e4d6] bg-white p-1.5 shadow-sm"><button onClick={() => setActiveMode("solo")} className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${activeMode === "solo" ? "bg-[#234d3d] text-white shadow" : "text-[#72847a] hover:text-[#234d3d]"}`}>1–5 properties <span className="ml-1 font-normal opacity-70">Solo hosts</span></button><button onClick={() => setActiveMode("pro")} className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${activeMode === "pro" ? "bg-[#234d3d] text-white shadow" : "text-[#72847a] hover:text-[#234d3d]"}`}>6+ properties <span className="ml-1 font-normal opacity-70">Pro managers</span></button></div>
            <div className="mt-10 grid items-center gap-10 rounded-[28px] border border-[#dce9dc] bg-white p-7 shadow-[0_18px_45px_rgba(35,77,61,0.05)] md:p-10 lg:grid-cols-[1fr_0.95fr]">
              <div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f4e9] text-[#4a9962]">{activeMode === "solo" ? <HomeIcon size={22} /> : <Layers3 size={22} />}</div><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a197]">{activeMode === "solo" ? "Solo host workspace" : "Professional manager workspace"}</p><h3 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.06em] text-[#234d3d]">{activeMode === "solo" ? "Everything you need to host brilliantly." : "Powerful enough for a growing portfolio."}</h3><p className="mt-4 max-w-[470px] text-[15px] leading-7 text-[#74867a]">{activeMode === "solo" ? "Look professional from day one. Manage reservations, send polished guest updates, and keep your numbers in check." : "Get portfolio-wide visibility, smarter bulk updates, and the automation your team needs to run more properties with less friction."}</p><div className="mt-7 grid gap-3 text-[13px] text-[#516a59]">{(activeMode === "solo" ? soloFeatures : proFeatures).map((item) => <div key={item} className="flex items-center gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f4e9] text-[#4a9962]"><Check size={12} /></span>{item}</div>)}</div></div>
              <div className="rounded-[22px] bg-[#f6faf5] p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#91a197]">{activeMode === "solo" ? "Host dashboard" : "Portfolio dashboard"}</p><p className="mt-1 text-sm font-semibold text-[#234d3d]">Good morning, {activeMode === "solo" ? "Ananya" : "Rohan"}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9eddc] text-xs font-bold text-[#40744f]">{activeMode === "solo" ? "AM" : "RK"}</div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4"><p className="text-[10px] text-[#95a49a]">Revenue this month</p><p className="mt-2 text-[24px] font-semibold tracking-[-0.06em] text-[#234d3d]">{activeMode === "solo" ? "₹92K" : "₹6.8L"}</p><p className="mt-1 text-[10px] font-bold text-[#4c9860]">↗ 12.4%</p></div><div className="rounded-2xl bg-white p-4"><p className="text-[10px] text-[#95a49a]">Occupancy</p><p className="mt-2 text-[24px] font-semibold tracking-[-0.06em] text-[#234d3d]">{activeMode === "solo" ? "74%" : "81%"}</p><div className="mt-2 h-1.5 rounded-full bg-[#e8efe8]"><div className="h-full rounded-full bg-[#8ec89b]" style={{ width: activeMode === "solo" ? "74%" : "81%" }} /></div></div></div><div className="mt-3 rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold text-[#74887a]">{activeMode === "solo" ? "All booking channels synced" : "Portfolio health"}</p><MoreHorizontal size={15} className="text-[#a0afa5]" /></div><div className="mt-4 flex items-end gap-1.5">{[34, 51, 42, 66, 54, 76, 68, 86, 73, 96, 82, 100].map((height, i) => <div key={i} className={`flex-1 rounded-t-sm ${i > 8 ? "bg-[#65ad76]" : "bg-[#c8e4cb]"}`} style={{ height: `${height / 1.7}px` }} />)}</div><div className="mt-2 flex justify-between text-[9px] text-[#a0afa5]"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></div></div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 px-5 py-24 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-[1180px] items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div><p className="eyebrow">Simple, honest pricing</p><h2 className="section-title mt-4">Scale up, <span className="text-[#7db487]">not out.</span></h2><p className="mt-5 max-w-[440px] text-[16px] leading-7 text-[#72847a]">Pay per listing, keep 100% of your direct booking revenue, and change your plan whenever your business changes.</p><div className="mt-8 grid gap-4 text-sm text-[#5e7565]"><div className="flex items-center gap-3"><ShieldCheck size={18} className="text-[#70ae7b]" /> No setup fees or hidden commissions</div><div className="flex items-center gap-3"><Headphones size={18} className="text-[#70ae7b]" /> Real human support when you need it</div><div className="flex items-center gap-3"><WalletCards size={18} className="text-[#70ae7b]" /> Cancel anytime, no awkward calls</div></div></div>
            <div className="rounded-[26px] border border-[#dfe9df] bg-white p-6 shadow-[0_20px_60px_rgba(35,77,61,0.07)] sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#234d3d]">Your plan</p><p className="mt-1 text-xs text-[#8b9c91]">Start small. Grow smoothly.</p></div><div className="flex rounded-full bg-[#f0f6ef] p-1"><button onClick={() => setAnnual(false)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${!annual ? "bg-white text-[#234d3d] shadow-sm" : "text-[#91a197]"}`}>Monthly</button><button onClick={() => setAnnual(true)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${annual ? "bg-white text-[#234d3d] shadow-sm" : "text-[#91a197]"}`}>Annual <span className="ml-1 text-[#5eae6c]">-20%</span></button></div></div><div className="my-7 h-px bg-[#edf2ed]" /><div className="flex items-end justify-between"><div><span className="text-[48px] font-semibold tracking-[-0.08em] text-[#234d3d]">₹{pricing.toLocaleString("en-IN")}</span><span className="ml-2 text-sm text-[#829489]">/ month</span></div><span className="rounded-full bg-[#edf8ee] px-3 py-1.5 text-[10px] font-bold text-[#5a9e67]">14-day free trial</span></div><div className="mt-8"><div className="flex items-center justify-between text-xs font-bold text-[#5c7463]"><span>How many listings?</span><span>{listings >= 10 ? "10+" : listings} {listings === 1 ? "listing" : "listings"}</span></div><input aria-label="Number of listings" type="range" min="1" max="10" value={listings} onChange={(event) => setListings(Number(event.target.value))} className="mt-4 h-1.5 w-full cursor-pointer accent-[#5a9f68]" /><div className="mt-2 flex justify-between text-[10px] text-[#a0afa5]"><span>1</span><span>5</span><span>10+</span></div></div><div className="mt-7 grid gap-3 text-[13px] text-[#5d7464]"><div className="flex items-center gap-2"><Check size={15} className="text-[#5eaa6c]" /> Unified calendar & channel manager</div><div className="flex items-center gap-2"><Check size={15} className="text-[#5eaa6c]" /> Professional booking website</div><div className="flex items-center gap-2"><Check size={15} className="text-[#5eaa6c]" /> Guest notifications & insights</div></div><button onClick={() => { window.location.href = "/stay"; }} className="mt-8 w-full rounded-full bg-[#234d3d] py-3.5 text-sm font-bold text-white transition hover:bg-[#2f654f] active:scale-[0.98]">Book our stay <ArrowRight className="ml-1 inline-block" size={15} /></button><p className="mt-3 text-center text-[10px] text-[#9aaa9f]">No card needed · switch or cancel anytime</p></div>
          </div>
        </section>

        <section id="stories" className="scroll-mt-20 border-y border-[#e5eee5] bg-[#f8fbf7] px-5 py-24 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-[1180px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Real hosts. Real relief.</p><h2 className="section-title mt-4">A calmer way to <span className="text-[#7db487]">grow.</span></h2></div><div className="flex gap-2"><button onClick={() => setTestimonialIndex((testimonialIndex + testimonials.length - 1) % testimonials.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e6d9] bg-white text-[#5e8066] transition hover:bg-[#edf7ee]" aria-label="Previous testimonial"><ChevronLeft size={17} /></button><button onClick={() => setTestimonialIndex((testimonialIndex + 1) % testimonials.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e6d9] bg-white text-[#5e8066] transition hover:bg-[#edf7ee]" aria-label="Next testimonial"><ChevronRight size={17} /></button></div></div><div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-[26px] bg-[#234d3d] p-7 text-white sm:p-10"><div className="flex text-[#f4c66d]"><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /></div><blockquote className="mt-7 max-w-[720px] text-[24px] font-medium leading-[1.3] tracking-[-0.04em] sm:text-[31px]">“{testimonials[testimonialIndex].quote}”</blockquote><div className="mt-10 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9ad5ac] text-xs font-bold text-[#234d3d]">{testimonials[testimonialIndex].initials}</div><div><p className="text-sm font-bold">{testimonials[testimonialIndex].name}</p><p className="mt-0.5 text-xs text-[#bcd4c1]">{testimonials[testimonialIndex].role}</p></div></div></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-[26px] border border-[#deebde] bg-white p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0e2] text-[#ba6b31]"><MessageCircle size={19} /></div><p className="mt-6 text-[19px] font-semibold leading-tight tracking-[-0.04em] text-[#234d3d]">Always-on support, from people who get hosting.</p><p className="mt-3 text-xs leading-5 text-[#84958a]">Onboarding, listing migration, training, and real humans when a guest needs you.</p></div><div className="rounded-[26px] border border-[#deebde] bg-white p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6a54bd]"><UsersRound size={19} /></div><p className="mt-6 text-[19px] font-semibold leading-tight tracking-[-0.04em] text-[#234d3d]">A growing community of thoughtful hosts.</p><p className="mt-3 text-xs leading-5 text-[#84958a]">Practical guides, templates, and ideas to help you host smarter.</p></div></div></div></div>
        </section>

        <section className="relative overflow-hidden bg-[#dceedd] px-5 py-20 sm:py-24 lg:px-8"><div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[30px] border-white/25" /><div className="pointer-events-none absolute -bottom-36 left-1/4 h-72 w-72 rounded-full border-[42px] border-white/20" /><div className="relative mx-auto max-w-[720px] text-center"><p className="eyebrow text-[#518466]">Ready when you are</p><h2 className="section-title mt-4">More time to host. <span className="text-[#5b9c67]">Less time managing.</span></h2><p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-7 text-[#5f7968]">Join hosts who are building calmer, more profitable stay businesses with stayzen.</p><button onClick={() => { window.location.href = "/stay"; }} className="mt-8 rounded-full bg-[#234d3d] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_25px_rgba(35,77,61,0.15)] transition hover:-translate-y-0.5 hover:bg-[#2f654f] active:scale-[0.98]">Book our stay <ArrowRight className="ml-1 inline-block" size={16} /></button><p className="mt-4 text-[10px] font-semibold text-[#72917c]">14 days free · No card needed · Cancel anytime</p></div></section>
      </main>

      <footer className="bg-[#234d3d] px-5 py-12 text-[#c4d9c8] lg:px-8"><div className="mx-auto max-w-[1180px]"><div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 sm:flex-row"><div><LogoMark compact /><p className="mt-5 max-w-[260px] text-xs leading-6 text-[#96b29d]">The calm operating system for modern stay businesses.</p></div><div className="grid grid-cols-2 gap-x-16 gap-y-8 text-xs sm:grid-cols-3"><div><p className="mb-3 font-bold text-white">Product</p><a href="#features" className="block py-1 text-[#9dbba3] hover:text-white">Features</a><a href="#pricing" className="block py-1 text-[#9dbba3] hover:text-white">Pricing</a><a href="#workflow" className="block py-1 text-[#9dbba3] hover:text-white">How it works</a></div><div><p className="mb-3 font-bold text-white">Company</p><a href="#stories" className="block py-1 text-[#9dbba3] hover:text-white">Host stories</a><a href="#top" className="block py-1 text-[#9dbba3] hover:text-white">About stayzen</a><button onClick={() => showToast("We would love to hear from you.")} className="block py-1 text-left text-[#9dbba3] hover:text-white">Contact</button></div><div><p className="mb-3 font-bold text-white">Get started</p>{isAuthenticated ? <button onClick={() => { window.location.href = "/profile"; }} className="block py-1 text-left text-[#9dbba3] hover:text-white">Profile</button> : <button onClick={() => { window.location.href = "/login"; }} className="block py-1 text-left text-[#9dbba3] hover:text-white">Log in</button>}<button onClick={() => { window.location.href = "/stay"; }} className="block py-1 text-left text-[#9dbba3] hover:text-white">Book our stay</button><a href="#pricing" className="block py-1 text-[#9dbba3] hover:text-white">Book a demo</a></div></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-[10px] text-[#86a48d] sm:flex-row"><span>© 2026 stayzen Technologies</span><span>Made for hosts, wherever they stay.</span></div></div></footer>
    </div>
  );
}
