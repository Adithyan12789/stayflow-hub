import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Archive,
  Camera,
  CreditCard,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Globe2,
  Ellipsis,
  Home,
  ImagePlus,
  LayoutDashboard,
  ListFilter,
  MapPin,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Save,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trpc } from "@/lib/trpc";

type ListingStatus = "Live" | "Draft" | "Paused";
type Listing = {
  id: string;
  name: string;
  city: string;
  type: string;
  status: ListingStatus;
  occupancy: number;
  revenue: string;
  image: string;
  rooms: number;
  price: number;
};

type FormState = {
  name: string;
  city: string;
  type: string;
  rooms: string;
  price: string;
  status: ListingStatus;
  description: string;
};

const initialListings: Listing[] = [
  { id: "hilltop-villa", name: "Hilltop Villa", city: "Manali, Himachal Pradesh", type: "Entire villa", status: "Live", occupancy: 78, revenue: "₹1,42,800", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=500&q=85", rooms: 4, price: 8400 },
  { id: "cedar-cottage", name: "Cedar Cottage", city: "Coonoor, Tamil Nadu", type: "Private cottage", status: "Live", occupancy: 71, revenue: "₹98,400", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=500&q=85", rooms: 2, price: 6200 },
  { id: "lakehouse-02", name: "Lakehouse 02", city: "Udaipur, Rajasthan", type: "Entire home", status: "Draft", occupancy: 0, revenue: "—", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=85", rooms: 3, price: 7200 },
  { id: "fern-room", name: "The Fern Room", city: "Panchgani, Maharashtra", type: "Private room", status: "Paused", occupancy: 42, revenue: "₹48,600", image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=500&q=85", rooms: 1, price: 3500 },
];

const bookingTrend = [
  { month: "Apr", bookings: 24, revenue: 168000, occupancy: 54 },
  { month: "May", bookings: 31, revenue: 212000, occupancy: 61 },
  { month: "Jun", bookings: 28, revenue: 196000, occupancy: 58 },
  { month: "Jul", bookings: 39, revenue: 278000, occupancy: 68 },
  { month: "Aug", bookings: 46, revenue: 342000, occupancy: 74 },
  { month: "Sep", bookings: 52, revenue: 389000, occupancy: 81 },
];

const channelMix = [
  { name: "Direct", value: 38, color: "#5fa875" },
  { name: "Airbnb", value: 27, color: "#e29c77" },
  { name: "Booking.com", value: 21, color: "#8275c5" },
  { name: "Other OTAs", value: 14, color: "#b8c5b7" },
];

const blankForm: FormState = { name: "", city: "", type: "Entire home", rooms: "2", price: "6500", status: "Draft", description: "" };

function initialForm(listing?: Listing): FormState {
  return listing ? { name: listing.name, city: listing.city, type: listing.type, rooms: String(listing.rooms), price: String(listing.price), status: listing.status, description: "A considered stay for guests looking for a beautiful base to explore the region." } : blankForm;
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const colors = { Live: "bg-[#e7f6e9] text-[#448557]", Draft: "bg-[#fff3df] text-[#a86d26]", Paused: "bg-[#f1f1ef] text-[#7b817a]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${colors[status]}`}><span className={`h-1.5 w-1.5 rounded-full ${status === "Live" ? "bg-[#59a66b]" : status === "Draft" ? "bg-[#d89a46]" : "bg-[#9ca29d]"}`} />{status}</span>;
}

function Brand() {
  return <a href="/#top" className="flex items-center gap-2.5"><div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#234d3d]"><div className="absolute left-[9px] top-[10px] h-[10px] w-[10px] rotate-45 rounded-[2px] bg-[#d5f0dc]" /><div className="absolute bottom-[8px] right-[8px] h-[12px] w-[12px] rotate-45 rounded-[2px] bg-[#9ad5ac]" /></div><span className="text-[17px] font-bold tracking-[-0.04em] text-[#234d3d]">stayzen</span></a>;
}

export default function HostDashboard() {
  const hostData = trpc.hostDashboardData.useQuery();
  const bookingDecision = trpc.hostBookingDecision.useMutation({ onSuccess: () => hostData.refetch() });
  const hostPropertyUpdate = trpc.hostPropertyUpdate.useMutation({ onSuccess: () => hostData.refetch() });
  const hostPropertyArchive = trpc.hostPropertyArchive.useMutation({ onSuccess: () => hostData.refetch() });
  const hostProfile = trpc.profile.useQuery();
  const profileUpdate = trpc.profileUpdate.useMutation({ onSuccess: () => { hostProfile.refetch(); flash("Host settings saved."); } });
  const [listings, setListings] = useState(initialListings);
  const [selectedId, setSelectedId] = useState<string | null>(initialListings[0].id);
  const [form, setForm] = useState<FormState>(() => initialForm(initialListings[0]));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ListingStatus>("All");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [chartPeriod, setChartPeriod] = useState<"6M" | "12M">("6M");
  const [requestStatus, setRequestStatus] = useState<"All" | "Pending" | "Confirmed" | "Cancelled">("All");
  const [requestDate, setRequestDate] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"Bank transfer" | "UPI" | "PayPal">("Bank transfer");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  useEffect(() => { if (hostProfile.data) { setPayoutMethod(hostProfile.data.payoutMethod ?? "Bank transfer"); setPayoutAccount(hostProfile.data.payoutAccount ?? ""); setPhotoUrls(hostProfile.data.propertyPhotoUrls ?? []); } }, [hostProfile.data]);

  const selected = listings.find((listing) => listing.id === selectedId) ?? null;
  const filteredListings = useMemo(() => listings.filter((listing) => {
    const matchesQuery = `${listing.name} ${listing.city} ${listing.type}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === "All" || listing.status === statusFilter);
  }), [listings, query, statusFilter]);

  const liveCount = listings.filter((listing) => listing.status === "Live").length;
  const averageOccupancy = Math.round(listings.reduce((total, listing) => total + listing.occupancy, 0) / listings.length);
  const chartData = chartPeriod === "6M" ? bookingTrend : [
    { month: "Oct", bookings: 19, revenue: 132000, occupancy: 48 },
    { month: "Nov", bookings: 22, revenue: 149000, occupancy: 51 },
    { month: "Dec", bookings: 35, revenue: 258000, occupancy: 63 },
    ...bookingTrend,
  ];
  const backendListings = (hostData.data?.properties ?? []).map((item) => ({ id: item.id || item.name, name: item.name, city: item.location, occupancy: item.occupancy || 0, rooms: item.rooms || 1 }));
  const filteredRequests = useMemo(() => (hostData.data?.requests ?? []).filter((request) => (requestStatus === "All" || request.status === requestStatus) && (!requestDate || request.checkIn >= requestDate)), [hostData.data?.requests, requestStatus, requestDate]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const openCreate = () => {
    setSelectedId(null);
    setForm(initialForm());
    setFormOpen(true);
  };

  const openEdit = (listing: Listing) => {
    setSelectedId(listing.id);
    setForm(initialForm(listing));
    setFormOpen(true);
  };

  const saveListing = () => {
    if (!form.name.trim() || !form.city.trim()) {
      flash("Add a property name and location to continue.");
      return;
    }
    if (selectedId) {
      setListings((current) => current.map((listing) => listing.id === selectedId ? { ...listing, name: form.name, city: form.city, type: form.type, status: form.status, rooms: Number(form.rooms) || 1, price: Number(form.price) || 0 } : listing));
      hostPropertyUpdate.mutate({ id: selectedId, data: { name: form.name, location: form.city, type: form.type, status: form.status === "Live" ? "live" : form.status === "Paused" ? "paused" : "setup", rooms: Number(form.rooms) || 1, price: Number(form.price) || 0, description: form.description } });
      flash(`${form.name} updated successfully.`);
    } else {
      const newListing: Listing = { id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`, name: form.name, city: form.city, type: form.type, status: form.status, occupancy: 0, revenue: "—", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=500&q=85", rooms: Number(form.rooms) || 1, price: Number(form.price) || 0 };
      setListings((current) => [newListing, ...current]);
      setSelectedId(newListing.id);
      flash(`${form.name} added to your listings.`);
    }
    setFormOpen(false);
  };

  const archiveListing = (listing: Listing) => {
    setListings((current) => current.map((item) => item.id === listing.id ? { ...item, status: "Paused" } : item));
    hostPropertyArchive.mutate({ id: listing.id });
    if (selectedId === listing.id) setForm((current) => ({ ...current, status: "Paused" }));
    flash(`${listing.name} archived. It is no longer accepting bookings.`);
  };

  const deleteListing = (listing: Listing) => {
    setListings((current) => current.filter((item) => item.id !== listing.id));
    setSelectedId(null);
    setFormOpen(false);
    flash(`${listing.name} removed from this demo workspace.`);
  };

  const toggleStatus = (listing: Listing) => {
    const nextStatus: ListingStatus = listing.status === "Live" ? "Paused" : "Live";
    setListings((current) => current.map((item) => item.id === listing.id ? { ...item, status: nextStatus } : item));
    if (selectedId === listing.id) setForm((current) => ({ ...current, status: nextStatus }));
    flash(`${listing.name} is now ${nextStatus.toLowerCase()}.`);
  };

  return <div className="min-h-screen bg-[#f7faf6] text-[#234d3d]">
    {notice && <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#234d3d] px-5 py-3 text-sm font-semibold text-white shadow-2xl" role="status">{notice}</div>}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-[#e0e9e0] bg-white transition-transform xl:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-[76px] items-center justify-between border-b border-[#edf2ed] px-7"><Brand /><button onClick={() => setMobileMenu(false)} className="rounded-lg p-2 text-[#7a8c80] xl:hidden" aria-label="Close menu"><X size={18} /></button></div>
      <div className="px-4 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a0afa5]">Workspace</p><nav className="mt-3 grid gap-1">
        {[{ label: "Overview", icon: LayoutDashboard }, { label: "My listings", icon: Building2, active: true }, { label: "Calendar", icon: CalendarDays }, { label: "Guest messages", icon: MessageSquare }].map(({ label, icon: Icon, active }) => <button key={label} onClick={() => !active && flash(`${label} is ready to connect next.`)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${active ? "bg-[#eaf5eb] text-[#34734b]" : "text-[#7c8d82] hover:bg-[#f3f8f2] hover:text-[#234d3d]"}`}><Icon size={17} />{label}{label === "Guest messages" && <span className="ml-auto rounded-full bg-[#f2dfc7] px-1.5 py-0.5 text-[9px] text-[#a16a32]">3</span>}</button>)}
      </nav></div>
      <div className="mt-10 px-4"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a0afa5]">Manage</p><nav className="mt-3 grid gap-1">{[{ label: "Payouts", icon: WalletCards }, { label: "Analytics", icon: BarChart3 }, { label: "Settings", icon: Settings2 }].map(({ label, icon: Icon }) => <button key={label} onClick={() => flash(`${label} is ready to connect next.`)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-[#7c8d82] transition hover:bg-[#f3f8f2] hover:text-[#234d3d]"><Icon size={17} />{label}</button>)}</nav></div>
      <div className="mt-auto p-4"><div className="rounded-2xl bg-[#f0f7ef] p-4"><div className="flex items-center gap-2 text-[11px] font-bold text-[#477a55]"><Sparkles size={14} /> Host tip</div><p className="mt-2 text-[11px] leading-5 text-[#718677]">Listings with 8+ photos get 2.4× more booking enquiries.</p><button onClick={() => flash("Photo checklist opened.")} className="mt-3 text-[11px] font-bold text-[#3e8552]">View checklist <ArrowUpRight className="ml-1 inline" size={12} /></button></div><button onClick={() => flash("Help center opened.")} className="mt-5 flex items-center gap-2 px-2 text-xs font-semibold text-[#84958a]"><CircleHelp size={15} /> Help center</button></div>
    </aside>
    {mobileMenu && <button className="fixed inset-0 z-40 bg-[#234d3d]/20 backdrop-blur-sm lg:hidden" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}

    <div className="xl:pl-[252px]">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e3ece2] bg-[#f7faf6]/90 px-5 backdrop-blur-xl sm:px-8 xl:px-10"><div className="flex items-center gap-3"><button onClick={() => setMobileMenu(true)} className="rounded-xl border border-[#dfe9df] bg-white p-2 xl:hidden" aria-label="Open navigation"><Menu size={19} /></button><div><p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aaa9f] sm:block">Tuesday, 9 September 2026</p><h1 className="mt-0.5 text-[20px] font-semibold tracking-[-0.05em] text-[#234d3d]">Good morning, Ananya <span aria-hidden>✦</span></h1></div></div><div className="flex items-center gap-2 sm:gap-4"><button onClick={() => flash("You are all caught up.")} className="relative rounded-xl p-2.5 text-[#6e8474] transition hover:bg-white"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d78b48]" /></button><div className="hidden h-7 w-px bg-[#dfe9df] sm:block" /><button onClick={() => flash("Profile menu opened.")} className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b9dec0] text-[10px] font-bold text-[#356446]">AM</span><span className="hidden text-xs font-bold text-[#567060] sm:block">Ananya Mehta</span><ChevronDown size={14} className="text-[#98a79c]" /></button></div></header>
      <main className="mx-auto max-w-[1380px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6e9b79]">Property portfolio</p><div className="mt-2 flex items-center gap-3"><h2 className="text-[32px] font-semibold tracking-[-0.07em] text-[#234d3d]">My listings</h2><span className="rounded-full bg-[#eaf5eb] px-2.5 py-1 text-[11px] font-bold text-[#4c9160]">{listings.length} total</span></div><p className="mt-2 text-sm text-[#7a8d80]">Keep your spaces fresh, accurate, and ready to welcome guests.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => { window.location.href = "/onboarding/host"; }} className="flex items-center justify-center gap-2 rounded-full border border-[#cfe0d0] bg-white px-5 py-3 text-sm font-bold text-[#4d8d5d]">Guided setup</button><button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-full bg-[#234d3d] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(35,77,61,0.16)] transition hover:-translate-y-0.5 hover:bg-[#2f654f] active:scale-[0.98]"><Plus size={17} /> Add a listing</button></div></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Live listings" value={String(liveCount).padStart(2, "0")} detail="properties accepting bookings" icon={Building2} color="green" /><StatCard label="Avg. occupancy" value={`${averageOccupancy}%`} detail="across your portfolio" icon={BarChart3} color="purple" /><StatCard label="Revenue this month" value="₹2.89L" detail="+18.4% from last month" icon={WalletCards} color="orange" /><StatCard label="Open enquiries" value="03" detail="reply within 24 hours" icon={MessageSquare} color="blue" /></div>
        <section className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><div className="rounded-[24px] border border-[#e1ebe0] bg-white p-5 shadow-[0_14px_40px_rgba(35,77,61,0.045)]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6e9b79]">Active portfolio</p><h3 className="mt-1 text-xl font-semibold">Live property listings</h3></div><span className="rounded-full bg-[#eaf5eb] px-3 py-1 text-[10px] font-bold text-[#4c9160]">{backendListings.length || listings.filter((item) => item.status === "Live").length} properties</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{(backendListings.length ? backendListings : listings.filter((item) => item.status === "Live")).slice(0, 4).map((item) => <div key={item.id} className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="text-sm font-bold">{item.name}</h4><p className="mt-1 flex items-center gap-1 text-[11px] text-[#8a9b91]"><MapPin size={11} /> {item.city}</p></div><span className="rounded-full bg-[#e7f6e9] px-2 py-1 text-[9px] font-bold text-[#448557]">Active</span></div><p className="mt-4 text-[11px] text-[#718677]">{item.rooms} rooms · {item.occupancy}% occupancy</p></div>)}</div></div><div className="rounded-[24px] border border-[#e1ebe0] bg-white p-5 shadow-[0_14px_40px_rgba(35,77,61,0.045)]"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6e9b79]">Needs your attention</p><h3 className="mt-1 text-xl font-semibold">Recent booking requests</h3><div className="mt-4 flex flex-wrap gap-2"><select value={requestStatus} onChange={(event) => setRequestStatus(event.target.value as typeof requestStatus)} className="rounded-lg border border-[#dfe9df] bg-white px-2.5 py-2 text-[10px] font-bold text-[#527260] outline-none"><option>All</option><option>Pending</option><option>Confirmed</option><option>Cancelled</option></select><input type="date" value={requestDate} onChange={(event) => setRequestDate(event.target.value)} className="rounded-lg border border-[#dfe9df] bg-white px-2.5 py-2 text-[10px] font-bold text-[#527260] outline-none" aria-label="Show requests from date" /></div><div className="mt-4 grid gap-3">{filteredRequests.length ? filteredRequests.slice(0, 4).map((request) => <div key={request.id} className="rounded-2xl border border-[#edf2ed] p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold">{request.guest}</p><p className="mt-1 text-[10px] text-[#8a9b91]">{request.stay} · {request.checkIn}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${request.status === "Pending" ? "bg-[#fff3df] text-[#a86d26]" : request.status === "Confirmed" ? "bg-[#e7f6e9] text-[#448557]" : "bg-[#f8e9e7] text-[#b9574c]"}`}>{request.status}</span></div>{request.status === "Pending" && <div className="mt-3 flex gap-2"><button onClick={() => request.id && bookingDecision.mutate({ id: request.id, decision: "Confirmed" })} className="rounded-lg bg-[#234d3d] px-3 py-2 text-[10px] font-bold text-white">Accept</button><button onClick={() => request.id && bookingDecision.mutate({ id: request.id, decision: "Cancelled" })} className="rounded-lg border border-[#f0c7c2] px-3 py-2 text-[10px] font-bold text-[#b9574c]">Decline</button></div>}</div>) : <p className="rounded-2xl bg-[#f7faf6] p-4 text-xs text-[#7d9082]">No requests match these filters.</p>}</div></div></section>
        <section className="mt-8 rounded-[24px] border border-[#e1ebe0] bg-white p-5 shadow-[0_14px_40px_rgba(35,77,61,0.045)] sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6e9b79]">Performance snapshot</p><h3 className="mt-1.5 text-[20px] font-semibold tracking-[-0.05em] text-[#234d3d]">Bookings & revenue trends</h3><p className="mt-1 text-xs text-[#91a097]">See how your portfolio is performing over time.</p></div>
            <div className="flex items-center gap-2"><div className="flex rounded-full bg-[#f1f7f0] p-1">{(["6M", "12M"] as const).map((period) => <button key={period} onClick={() => setChartPeriod(period)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${chartPeriod === period ? "bg-white text-[#234d3d] shadow-sm" : "text-[#91a097]"}`}>{period}</button>)}</div><button onClick={() => flash("Analytics export is ready to connect.")} className="rounded-xl border border-[#e0eae0] p-2 text-[#72877a] transition hover:bg-[#f2f8f1]" aria-label="Export analytics"><ArrowUpRight size={16} /></button></div>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.7fr)]">
            <div className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4 sm:p-5"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa99f]">Total revenue</p><p className="mt-1 text-[27px] font-semibold tracking-[-0.07em] text-[#234d3d]">₹3.89L</p></div><span className="rounded-full bg-[#e8f6ea] px-2.5 py-1 text-[10px] font-bold text-[#4d9860]">↗ 18.4%</span></div><div className="mt-4 h-[210px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#72b981" stopOpacity={0.32} /><stop offset="100%" stopColor="#72b981" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid stroke="#e6eee5" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9aa99f", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#9aa99f", fontSize: 10 }} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} /><Tooltip contentStyle={{ border: "1px solid #deebde", borderRadius: 12, boxShadow: "0 8px 20px rgba(35,77,61,.08)", fontSize: 11 }} /><Area type="monotone" dataKey="revenue" stroke="#5fa875" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 5, fill: "#234d3d", strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div><div className="mt-1 flex items-center gap-2 text-[10px] text-[#91a097]"><span className="h-2 w-2 rounded-full bg-[#5fa875]" /> Gross booking revenue <span className="ml-auto">Last updated today</span></div></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><div className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa99f]">Booking volume</p><CalendarDays size={16} className="text-[#7eb888]" /></div><div className="mt-2 flex items-end gap-2"><p className="text-[27px] font-semibold tracking-[-0.07em] text-[#234d3d]">52</p><span className="pb-1 text-[10px] font-bold text-[#4d9860]">+13.0%</span></div><div className="mt-4 h-[92px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}><XAxis dataKey="month" hide /><YAxis hide /><Tooltip cursor={{ fill: "#edf6ec" }} contentStyle={{ border: "none", borderRadius: 10, fontSize: 10 }} /><Bar dataKey="bookings" fill="#c2e2c5" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa99f]">Occupancy rate</p><p className="mt-1 text-[22px] font-semibold tracking-[-0.06em] text-[#234d3d]">81%</p></div><span className="rounded-full bg-[#f0ecff] px-2 py-1 text-[9px] font-bold text-[#7660c3]">+7.2%</span></div><div className="mt-2 h-[70px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 0, left: -32, bottom: 0 }}><XAxis dataKey="month" hide /><YAxis domain={[0, 100]} hide /><Line type="monotone" dataKey="occupancy" stroke="#8275c5" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div></div></div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]"><div className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa99f]">Revenue by property</p><p className="mt-1 text-xs text-[#7d9082]">Top contributors this month</p></div><BarChart3 size={17} className="text-[#7eb888]" /></div><div className="mt-4 h-[130px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: "Hilltop", revenue: 142 }, { name: "Cedar", revenue: 98 }, { name: "Fern", revenue: 49 }]} layout="vertical" margin={{ top: 0, right: 8, left: 2, bottom: 0 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#74887a", fontSize: 10 }} width={48} /><Tooltip cursor={{ fill: "#edf6ec" }} contentStyle={{ border: "none", borderRadius: 10, fontSize: 10 }} /><Bar dataKey="revenue" fill="#8bc692" radius={[0, 5, 5, 0]} barSize={14} /></BarChart></ResponsiveContainer></div></div><div className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa99f]">Booking channel mix</p><p className="mt-1 text-xs text-[#7d9082]">Where your guests are coming from</p></div><Globe2 size={17} className="text-[#7eb888]" /></div><div className="mt-1 flex items-center gap-3"><div className="h-[140px] w-[140px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={3} stroke="none">{channelMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ border: "none", borderRadius: 10, fontSize: 10 }} /></PieChart></ResponsiveContainer></div><div className="grid flex-1 gap-2">{channelMix.map((channel) => <div key={channel.name} className="flex items-center justify-between gap-2 text-[10px] text-[#718578]"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: channel.color }} />{channel.name}</span><strong className="text-[#527260]">{channel.value}%</strong></div>)}</div></div></div></div>
        </section>
        <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
          <section className="min-w-0 rounded-[24px] border border-[#e1ebe0] bg-white shadow-[0_14px_40px_rgba(35,77,61,0.045)]"><div className="flex flex-col justify-between gap-4 border-b border-[#edf2ed] p-5 sm:flex-row sm:items-center sm:px-6"><div><h3 className="text-[17px] font-semibold tracking-[-0.04em] text-[#234d3d]">All properties</h3><p className="mt-1 text-xs text-[#91a097]">Edit details, availability, and status</p></div><div className="flex gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e0eae0] bg-[#fbfdfb] px-3 py-2 sm:w-[185px] sm:flex-none"><Search size={15} className="shrink-0 text-[#9aa99f]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search listings" className="min-w-0 bg-transparent text-xs text-[#234d3d] outline-none placeholder:text-[#a6b2a9]" /></label><button onClick={() => flash("Advanced filters are ready to connect.")} className="rounded-xl border border-[#e0eae0] p-2.5 text-[#6f8576] transition hover:bg-[#f1f7f0]" aria-label="Filter listings"><SlidersHorizontal size={16} /></button></div></div><div className="flex items-center gap-1 overflow-x-auto border-b border-[#edf2ed] px-5 py-3 sm:px-6">{(["All", "Live", "Draft", "Paused"] as const).map((filter) => <button key={filter} onClick={() => setStatusFilter(filter)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition ${statusFilter === filter ? "bg-[#234d3d] text-white" : "text-[#84958a] hover:bg-[#f1f7f0]"}`}>{filter}{filter !== "All" && <span className="ml-1 opacity-65">{listings.filter((listing) => listing.status === filter).length}</span>}</button>)}</div><div className="hidden overflow-x-auto xl:block"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-[#edf2ed] text-[10px] font-bold uppercase tracking-[0.12em] text-[#a0afa5]"><th className="px-6 py-4 font-bold">Property</th><th className="px-4 py-4 font-bold">Status</th><th className="px-4 py-4 font-bold">Occupancy</th><th className="px-4 py-4 font-bold">Revenue</th><th className="px-4 py-4 font-bold text-right">Actions</th></tr></thead><tbody>{filteredListings.map((listing) => <tr key={listing.id} onClick={() => { setSelectedId(listing.id); setForm(initialForm(listing)); }} className={`cursor-pointer border-b border-[#f0f4ef] transition hover:bg-[#fbfdfb] ${selectedId === listing.id ? "bg-[#f7fbf6]" : ""}`}><td className="px-6 py-4"><div className="flex items-center gap-3"><img src={listing.image} alt="" className="h-11 w-14 rounded-xl object-cover" /><div><p className="text-[13px] font-bold text-[#234d3d]">{listing.name}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#93a198]"><MapPin size={10} /> {listing.city}</p></div></div></td><td className="px-4 py-4"><StatusBadge status={listing.status} /></td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-[#e7efe6]"><div className="h-full rounded-full bg-[#75b681]" style={{ width: `${listing.occupancy}%` }} /></div><span className="text-xs font-semibold text-[#668070]">{listing.occupancy}%</span></div></td><td className="px-4 py-4 text-xs font-bold text-[#527260]">{listing.revenue}</td><td className="px-4 py-4"><div className="flex justify-end gap-1"><button onClick={(event) => { event.stopPropagation(); openEdit(listing); }} className="rounded-lg p-2 text-[#83958a] transition hover:bg-[#eaf5eb] hover:text-[#3d8350]" aria-label={`Edit ${listing.name}`}><Pencil size={15} /></button><button onClick={(event) => { event.stopPropagation(); archiveListing(listing); }} className="rounded-lg p-2 text-[#83958a] transition hover:bg-[#fff2e0] hover:text-[#b5762d]" aria-label={`Archive ${listing.name}`}><Archive size={15} /></button></div></td></tr>)}</tbody></table>{filteredListings.length === 0 && <EmptyState onAdd={openCreate} />}</div><div className="grid gap-3 p-4 xl:hidden">{filteredListings.map((listing) => <div key={listing.id} onClick={() => { setSelectedId(listing.id); setForm(initialForm(listing)); }} className={`rounded-2xl border p-3 ${selectedId === listing.id ? "border-[#acd6b1] bg-[#f7fbf6]" : "border-[#e7eee6]"}`}><div className="flex items-center gap-3"><img src={listing.image} alt="" className="h-14 w-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-[13px] font-bold text-[#234d3d]">{listing.name}</p><StatusBadge status={listing.status} /></div><p className="mt-1 truncate text-[10px] text-[#93a198]">{listing.city}</p><div className="mt-2 flex items-center gap-2"><div className="h-1.5 w-14 rounded-full bg-[#e7efe6]"><div className="h-full rounded-full bg-[#75b681]" style={{ width: `${listing.occupancy}%` }} /></div><span className="text-[10px] font-semibold text-[#668070]">{listing.occupancy}% occupancy</span></div></div></div><div className="mt-3 flex items-center justify-between border-t border-[#edf2ed] pt-3"><span className="text-xs font-bold text-[#527260]">{listing.revenue}</span><div className="flex items-center gap-3"><button onClick={(event) => { event.stopPropagation(); openEdit(listing); }} className="flex items-center gap-1.5 text-[11px] font-bold text-[#4a8b59]"><Pencil size={13} /> Edit</button><button onClick={(event) => { event.stopPropagation(); archiveListing(listing); }} className="flex items-center gap-1.5 text-[11px] font-bold text-[#b5762d]"><Archive size={13} /> Archive</button></div></div></div>)}{filteredListings.length === 0 && <EmptyState onAdd={openCreate} />}</div></section>
          <aside className="rounded-[24px] border border-[#e1ebe0] bg-white shadow-[0_14px_40px_rgba(35,77,61,0.045)]"><div className="flex items-center justify-between border-b border-[#edf2ed] px-5 py-5"><div><h3 className="text-[17px] font-semibold tracking-[-0.04em] text-[#234d3d]">{selected ? "Listing overview" : "Add a listing"}</h3><p className="mt-1 text-xs text-[#91a097]">{selected ? "A quick look at this property" : "Create your first property"}</p></div><button onClick={openCreate} className="rounded-xl bg-[#eaf5eb] p-2 text-[#428454] transition hover:bg-[#ddefdf]" aria-label="Add listing"><Plus size={17} /></button></div>{selected ? <div><img src={selected.image} alt={selected.name} className="h-40 w-full object-cover" /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="text-[20px] font-semibold tracking-[-0.05em] text-[#234d3d]">{selected.name}</h4><p className="mt-1 flex items-center gap-1 text-xs text-[#83958a]"><MapPin size={12} /> {selected.city}</p></div><StatusBadge status={selected.status} /></div><div className="mt-5 grid grid-cols-2 gap-2"><MiniMetric label="Nightly rate" value={`₹${selected.price.toLocaleString("en-IN")}`} /><MiniMetric label="Bedrooms" value={String(selected.rooms)} /></div><div className="mt-5 rounded-2xl bg-[#f5faf4] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold text-[#6e8375]">Current occupancy</span><span className="text-sm font-bold text-[#4b925a]">{selected.occupancy}%</span></div><div className="mt-3 h-2 rounded-full bg-[#deebdd]"><div className="h-full rounded-full bg-[#77b883]" style={{ width: `${selected.occupancy}%` }} /></div><p className="mt-3 text-[10px] text-[#91a097]">Up 8% from this time last month</p></div><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => openEdit(selected)} className="flex items-center justify-center gap-2 rounded-xl bg-[#234d3d] py-3 text-xs font-bold text-white transition hover:bg-[#2f654f]"><Pencil size={14} /> Edit details</button><button onClick={() => toggleStatus(selected)} className="flex items-center justify-center gap-2 rounded-xl border border-[#dce8dc] py-3 text-xs font-bold text-[#527260] transition hover:bg-[#f4f9f3]"><SlidersHorizontal size={14} /> {selected.status === "Live" ? "Pause" : "Publish"}</button></div><button onClick={() => deleteListing(selected)} className="mt-4 flex w-full items-center justify-center gap-2 py-2 text-[11px] font-bold text-[#b97770] transition hover:text-[#a84f47]"><Trash2 size={13} /> Remove listing</button></div></div> : <div className="p-5"><div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfe2d0] bg-[#f8fcf7] text-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5eb] text-[#5b9b67]"><ImagePlus size={20} /></div><p className="mt-3 text-xs font-bold text-[#517060]">Add property photos later</p><p className="mt-1 max-w-[180px] text-[10px] leading-4 text-[#99a79e]">You can upload a gallery after saving the basics.</p></div><button onClick={openCreate} className="mt-5 w-full rounded-xl bg-[#234d3d] py-3 text-sm font-bold text-white transition hover:bg-[#2f654f]">Create a listing <Plus className="ml-1 inline" size={15} /></button></div>}</aside>
        </div>
        <section className="mt-8 grid gap-7 lg:grid-cols-[1fr_1fr]"><div className="rounded-[24px] border border-[#e1ebe0] bg-white p-5 shadow-[0_14px_40px_rgba(35,77,61,0.045)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6e9b79]">Host profile</p><h3 className="mt-1 text-xl font-semibold">Payout settings</h3><p className="mt-1 text-xs text-[#91a097]">Choose where stayzen sends your booking earnings.</p></div><CreditCard className="text-[#72ae7c]" size={20} /></div><div className="mt-5 grid gap-4"><label className="grid gap-2 text-xs font-bold text-[#5d7464]"><span>Payout method</span><select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value as typeof payoutMethod)} className="h-11 rounded-xl border border-[#dfe9df] bg-white px-3 text-sm font-medium text-[#234d3d] outline-none"><option>Bank transfer</option><option>UPI</option><option>PayPal</option></select></label><Field label="Account, UPI ID, or email" value={payoutAccount} placeholder="e.g. host@upi" onChange={setPayoutAccount} /><button disabled={profileUpdate.isPending} onClick={() => profileUpdate.mutate({ payoutMethod, payoutAccount, propertyPhotoUrls: photoUrls })} className="flex items-center justify-center gap-2 rounded-xl bg-[#234d3d] py-3 text-xs font-bold text-white disabled:opacity-60"><Save size={14} /> {profileUpdate.isPending ? "Saving…" : "Save payout settings"}</button></div></div><div className="rounded-[24px] border border-[#e1ebe0] bg-white p-5 shadow-[0_14px_40px_rgba(35,77,61,0.045)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6e9b79]">Property media</p><h3 className="mt-1 text-xl font-semibold">Photo gallery</h3><p className="mt-1 text-xs text-[#91a097]">Manage the gallery URLs shown with your host profile.</p></div><Camera className="text-[#72ae7c]" size={20} /></div><div className="mt-5 grid grid-cols-3 gap-2">{photoUrls.map((url, index) => <div key={`${url}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f1f7f0]"><img src={url} alt={`Property gallery ${index + 1}`} className="h-full w-full object-cover" /><button onClick={() => setPhotoUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 rounded-full bg-[#234d3d]/80 px-2 py-1 text-[10px] font-bold text-white">×</button></div>)}{photoUrls.length === 0 && <div className="col-span-3 rounded-xl border border-dashed border-[#cfe2d0] bg-[#f8fcf7] p-5 text-center text-xs text-[#819789]">No gallery photos yet.</div>}</div><div className="mt-4 flex gap-2"><input value={newPhotoUrl} onChange={(event) => setNewPhotoUrl(event.target.value)} placeholder="Paste an image URL" className="min-w-0 flex-1 rounded-xl border border-[#dfe9df] px-3 py-2 text-xs outline-none" /><button onClick={() => { try { new URL(newPhotoUrl); setPhotoUrls((current) => [...current, newPhotoUrl]); setNewPhotoUrl(""); } catch { flash("Enter a valid image URL."); } }} className="rounded-xl border border-[#cfe0d0] px-3 py-2 text-xs font-bold text-[#4d8d5d]"><Plus size={14} /></button></div><button disabled={profileUpdate.isPending} onClick={() => profileUpdate.mutate({ payoutMethod, payoutAccount, propertyPhotoUrls: photoUrls })} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe9df] py-3 text-xs font-bold text-[#527260] disabled:opacity-60"><Save size={14} /> Save gallery</button></div></section>
      </main>
    </div>

    {formOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#173b2c]/25 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[26px] bg-white shadow-2xl sm:max-w-[560px] sm:rounded-[26px]"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf2ed] bg-white px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6e9b79]">{selectedId ? "Edit listing" : "New listing"}</p><h3 className="mt-1 text-[22px] font-semibold tracking-[-0.05em] text-[#234d3d]">{selectedId ? "Keep your property fresh" : "Add a new accommodation"}</h3></div><button onClick={() => setFormOpen(false)} className="rounded-xl border border-[#e0eae0] p-2 text-[#819187] hover:bg-[#f4f9f3]" aria-label="Close form"><X size={18} /></button></div><div className="grid gap-5 px-6 py-6"><Field label="Property name" value={form.name} placeholder="e.g. The Mango House" onChange={(value) => setForm((current) => ({ ...current, name: value }))} /><div className="grid gap-5 sm:grid-cols-2"><Field label="City and region" value={form.city} placeholder="e.g. Goa, India" onChange={(value) => setForm((current) => ({ ...current, city: value }))} /><label className="grid gap-2 text-xs font-bold text-[#5d7464]"><span>Property type</span><select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="h-11 rounded-xl border border-[#dfe9df] bg-white px-3 text-sm font-medium text-[#234d3d] outline-none focus:border-[#7db487] focus:ring-2 focus:ring-[#dceedd]"><option>Entire home</option><option>Entire villa</option><option>Private cottage</option><option>Private room</option><option>Homestay</option></select></label></div><div className="grid gap-5 sm:grid-cols-3"><Field label="Bedrooms" value={form.rooms} type="number" onChange={(value) => setForm((current) => ({ ...current, rooms: value }))} /><Field label="Nightly rate (₹)" value={form.price} type="number" onChange={(value) => setForm((current) => ({ ...current, price: value }))} /><label className="grid gap-2 text-xs font-bold text-[#5d7464]"><span>Listing status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ListingStatus }))} className="h-11 rounded-xl border border-[#dfe9df] bg-white px-3 text-sm font-medium text-[#234d3d] outline-none focus:border-[#7db487] focus:ring-2 focus:ring-[#dceedd]"><option>Draft</option><option>Live</option><option>Paused</option></select></label></div><label className="grid gap-2 text-xs font-bold text-[#5d7464]"><span>Short description <span className="font-normal text-[#a0afa5]">(optional)</span></span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Tell guests what makes this stay special..." className="resize-none rounded-xl border border-[#dfe9df] px-3 py-3 text-sm font-medium text-[#234d3d] outline-none placeholder:text-[#a6b2a9] focus:border-[#7db487] focus:ring-2 focus:ring-[#dceedd]" /></label><div className="rounded-2xl bg-[#f3f9f2] p-4 text-[11px] leading-5 text-[#708678]"><div className="flex gap-2 font-bold text-[#4b8259]"><Check size={15} className="mt-0.5 shrink-0" /> You can add photos, amenities, and booking rules after saving.</div></div></div><div className="flex gap-3 border-t border-[#edf2ed] px-6 py-5"><button onClick={() => setFormOpen(false)} className="flex-1 rounded-xl border border-[#dfe9df] py-3 text-sm font-bold text-[#6e8274] transition hover:bg-[#f4f9f3]">Cancel</button><button onClick={saveListing} className="flex-[1.5] rounded-xl bg-[#234d3d] py-3 text-sm font-bold text-white transition hover:bg-[#2f654f]">{selectedId ? "Save changes" : "Create listing"} <Check className="ml-1 inline" size={15} /></button></div></div></div>}
  </div>;
}

function Field({ label, value, placeholder, type = "text", onChange }: { label: string; value: string; placeholder?: string; type?: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-xs font-bold text-[#5d7464]"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border border-[#dfe9df] px-3 text-sm font-medium text-[#234d3d] outline-none placeholder:text-[#a6b2a9] focus:border-[#7db487] focus:ring-2 focus:ring-[#dceedd]" /></label>;
}

function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#e8efe7] bg-[#fbfdfb] p-3"><p className="text-[10px] text-[#98a79d]">{label}</p><p className="mt-1 text-sm font-bold text-[#234d3d]">{value}</p></div>; }
function EmptyState({ onAdd }: { onAdd: () => void }) { return <div className="p-10 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf5eb] text-[#4a925d]"><Search size={19} /></div><p className="mt-3 text-sm font-bold text-[#527060]">No listings match that search</p><button onClick={onAdd} className="mt-3 text-xs font-bold text-[#438553]">Add a new listing <Plus className="ml-1 inline" size={13} /></button></div>; }
function StatCard({ label, value, detail, icon: Icon, color }: { label: string; value: string; detail: string; icon: typeof Building2; color: string }) { const styles: Record<string, string> = { green: "bg-[#eaf5eb] text-[#4b9560]", purple: "bg-[#f0ecff] text-[#7660c3]", orange: "bg-[#fff0e2] text-[#ba6f35]", blue: "bg-[#eaf4ff] text-[#4d87b8]" }; return <div className="rounded-[20px] border border-[#e1ebe0] bg-white p-5 shadow-[0_10px_28px_rgba(35,77,61,0.035)]"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold text-[#8c9c92]">{label}</p><p className="mt-2 text-[28px] font-semibold tracking-[-0.07em] text-[#234d3d]">{value}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}><Icon size={19} /></div></div><p className="mt-3 text-[10px] text-[#92a199]">{detail}</p></div>; }
