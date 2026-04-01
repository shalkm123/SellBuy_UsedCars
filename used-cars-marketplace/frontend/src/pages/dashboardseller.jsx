import { useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const LISTINGS = [
  { id: 1, name: "Blue Audi (PSD)", type: "Hatchback", fuel: "Diesel", transmission: "Auto", price: 348980, status: "Active", bids: 7, seller: "Mulika Ielia", avatar: "MI", color: "#3B82F6", img: "🚗" },
  { id: 2, name: "Bentley GT", type: "Hatchback", fuel: "Diesel", transmission: "Auto", price: 789345, status: "Active", bids: 12, seller: "Rabin", avatar: "R", color: "#F97316", img: "🏎️" },
  { id: 3, name: "Tesla Model S", type: "Sedan", fuel: "Electric", transmission: "Auto", price: 520000, status: "Pending", bids: 3, seller: "Aryan K", avatar: "AK", color: "#8B5CF6", img: "🚘" },
  { id: 4, name: "Toyota Land Cruiser", type: "SUV", fuel: "Petrol", transmission: "Auto", price: 430000, status: "Sold", bids: 19, seller: "Priya M", avatar: "PM", color: "#10B981", img: "🚙" },
  { id: 5, name: "Mercedes C-Class", type: "Sedan", fuel: "Diesel", transmission: "Manual", price: 615000, status: "Active", bids: 5, seller: "Rahul S", avatar: "RS", color: "#EC4899", img: "🚗" },
  { id: 6, name: "Ford Mustang GT", type: "Coupe", fuel: "Petrol", transmission: "Manual", price: 890000, status: "Active", bids: 22, seller: "Neha V", avatar: "NV", color: "#EF4444", img: "🏎️" },
];

const BIDS = [
  { id: 1, car: "Blue Audi (PSD)", bidder: "Arjun Mehta", amount: 352000, time: "2m ago", status: "New" },
  { id: 2, car: "Bentley GT", bidder: "Sonia Kapoor", amount: 795000, time: "14m ago", status: "New" },
  { id: 3, car: "Ford Mustang GT", bidder: "Dev Sharma", amount: 875000, time: "1h ago", status: "Reviewed" },
  { id: 4, car: "Mercedes C-Class", bidder: "Priya Singh", amount: 610000, time: "3h ago", status: "Reviewed" },
  { id: 5, car: "Tesla Model S", bidder: "Kabir Nair", amount: 518000, time: "5h ago", status: "Accepted" },
];

const RECENT_TXNS = [
  { id: 1, car: "Toyota Land Cruiser", buyer: "Rohit Verma", amount: 430000, date: "Mar 30", type: "Sale" },
  { id: 2, car: "Honda City (2022)", buyer: "Anita Desai", amount: 185000, date: "Mar 28", type: "Sale" },
  { id: 3, car: "Maruti Suzuki Brezza", buyer: "Suresh K", amount: 142000, date: "Mar 25", type: "Sale" },
];

const NAV = [
  { label: "Dashboard", icon: "⊞", id: "dashboard" },
  { label: "Listing", icon: "☰", id: "listing" },
  { label: "Calendar", icon: "📅", id: "calendar" },
  { label: "Deals", icon: "🤝", id: "deals" },
  { label: "Tracking", icon: "📍", id: "tracking" },
  { label: "Active Bids", icon: "🔨", id: "bids" },
  { label: "Statistics", icon: "📊", id: "stats" },
  { label: "Transaction", icon: "💳", id: "transaction" },
];

const OTHER_NAV = [
  { label: "Support", icon: "🎧", id: "support" },
  { label: "Settings", icon: "⚙️", id: "settings" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => "₹ " + n.toLocaleString("en-IN");

function Avatar({ initials, color, size = 9 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Active: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Sold: "bg-blue-100 text-blue-700",
    New: "bg-blue-100 text-blue-700",
    Reviewed: "bg-gray-100 text-gray-600",
    Accepted: "bg-green-100 text-green-700",
    Sale: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, trend }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl`} style={{ background: accent + "18" }}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Car Listing Card ─────────────────────────────────────────────────────────
function CarCard({ car, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      {/* Car visual header */}
      <div className="h-32 flex items-center justify-center relative" style={{ background: car.color + "12" }}>
        <span className="text-6xl">{car.img}</span>
        <div className="absolute top-3 right-3">
          <StatusBadge status={car.status} />
        </div>
      </div>

      <div className="p-4">
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar initials={car.avatar} color={car.color} size={7} />
          <span className="text-xs text-gray-500 font-medium">{car.seller}</span>
        </div>

        {/* Title + price */}
        <h3 className="font-bold text-gray-800 text-sm mb-1">{car.name}</h3>
        <p className="text-blue-600 font-bold text-base mb-3">{fmt(car.price)}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[car.type, car.transmission, car.fuel].map((tag) => (
            <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">🔨</span>
            <span className="text-xs font-semibold text-gray-600">{car.bids} bids</span>
          </div>
          <button
            onClick={() => onView(car)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
          >
            View →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Listing Modal ────────────────────────────────────────────────────────
function AddListingModal({ onClose }) {
  const [form, setForm] = useState({ name: "", price: "", type: "Sedan", fuel: "Petrol", transmission: "Auto" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors bg-white";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors text-xl">✕</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">🚗</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Listing</h2>
            <p className="text-xs text-gray-400">Fill in car details to publish</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Car Name *</label>
            <input className={inputCls} placeholder="e.g. Honda City 2023" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Asking Price (₹) *</label>
            <input className={inputCls} placeholder="e.g. 500000" type="number" value={form.price} onChange={set("price")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Type", key: "type", opts: ["Sedan", "SUV", "Hatchback", "Coupe", "MUV"] },
              { label: "Fuel", key: "fuel", opts: ["Petrol", "Diesel", "Electric", "CNG"] },
              { label: "Transmission", key: "transmission", opts: ["Auto", "Manual", "CVT"] },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                <select className={inputCls + " cursor-pointer"} value={form[key]} onChange={set(key)}>
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-200">
            Publish Listing 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value="24" sub="6 added this week" icon="🚗" accent="#3B82F6" trend={12} />
        <StatCard label="Active Bids" value="41" sub="3 need your response" icon="🔨" accent="#F97316" trend={8} />
        <StatCard label="Revenue (Mar)" value="₹ 18.4L" sub="vs ₹ 15.2L last month" icon="💰" accent="#10B981" trend={21} />
        <StatCard label="Cars Sold" value="9" sub="this month" icon="🏆" accent="#8B5CF6" trend={-5} />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Bids Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-800">Active Bids</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest offers on your cars</p>
            </div>
            <button onClick={() => setPage("bids")} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
              See all →
            </button>
          </div>

          <div className="space-y-3">
            {BIDS.slice(0, 4).map((bid) => (
              <div key={bid.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar initials={bid.bidder.slice(0, 2).toUpperCase()} color="#3B82F6" size={9} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{bid.bidder}</p>
                  <p className="text-xs text-gray-400 truncate">{bid.car}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{fmt(bid.amount)}</p>
                  <p className="text-[10px] text-gray-400">{bid.time}</p>
                </div>
                <StatusBadge status={bid.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-blue-600 rounded-2xl p-5 text-white">
            <p className="text-blue-200 text-xs font-semibold mb-1">Monthly Target</p>
            <p className="text-3xl font-bold mb-3">73%</p>
            <div className="h-2 bg-blue-500 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "73%" }} />
            </div>
            <p className="text-blue-200 text-xs mt-2">₹ 18.4L / ₹ 25L goal</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 mb-3">Listing Status</p>
            {[
              { label: "Active", count: 14, color: "#22C55E" },
              { label: "Pending", count: 6, color: "#F59E0B" },
              { label: "Sold", count: 4, color: "#3B82F6" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm text-gray-600 flex-1">{label}</span>
                <span className="text-sm font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 3 completed sales</p>
          </div>
          <button onClick={() => setPage("transaction")} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 text-left font-semibold">Car</th>
                <th className="pb-3 text-left font-semibold">Buyer</th>
                <th className="pb-3 text-left font-semibold">Date</th>
                <th className="pb-3 text-left font-semibold">Amount</th>
                <th className="pb-3 text-left font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TXNS.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-gray-800">{txn.car}</td>
                  <td className="py-3 text-gray-500">{txn.buyer}</td>
                  <td className="py-3 text-gray-400 text-xs">{txn.date}</td>
                  <td className="py-3 font-bold text-blue-600">{fmt(txn.amount)}</td>
                  <td className="py-3"><StatusBadge status={txn.type} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ListingPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Active", "Pending", "Sold"];
  const filtered = filter === "All" ? LISTINGS : LISTINGS.filter((c) => c.status === filter);

  return (
    <div className="space-y-5">
      {showModal && <AddListingModal onClose={() => setShowModal(false)} />}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200"
        >
          <span className="text-base leading-none">+</span> Add Listing
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((car) => (
          <CarCard key={car.id} car={car} onView={() => {}} />
        ))}
      </div>
    </div>
  );
}

function BidsPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-lg">All Active Bids</h3>
        <p className="text-xs text-gray-400 mt-0.5">Review and respond to offers on your listings</p>
      </div>
      <div className="space-y-3">
        {BIDS.map((bid) => (
          <div key={bid.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
            <Avatar initials={bid.bidder.slice(0, 2).toUpperCase()} color="#3B82F6" size={10} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{bid.bidder}</p>
              <p className="text-xs text-gray-400">{bid.car} · {bid.time}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900 text-base">{fmt(bid.amount)}</p>
              <StatusBadge status={bid.status} />
            </div>
            {bid.status === "New" && (
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all">Accept</button>
                <button className="px-3 py-1.5 rounded-xl border-2 border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Transaction History</h3>
        <p className="text-xs text-gray-400 mt-0.5">All completed sales and payments</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="pb-3 text-left font-semibold">#</th>
              <th className="pb-3 text-left font-semibold">Car</th>
              <th className="pb-3 text-left font-semibold">Buyer</th>
              <th className="pb-3 text-left font-semibold">Date</th>
              <th className="pb-3 text-right font-semibold">Amount</th>
              <th className="pb-3 text-center font-semibold">Type</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_TXNS.map((txn, i) => (
              <tr key={txn.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3.5 text-gray-400 text-xs">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-3.5 font-semibold text-gray-800">{txn.car}</td>
                <td className="py-3.5 text-gray-500">{txn.buyer}</td>
                <td className="py-3.5 text-gray-400 text-xs">{txn.date}</td>
                <td className="py-3.5 font-bold text-blue-600 text-right">{fmt(txn.amount)}</td>
                <td className="py-3.5 text-center"><StatusBadge status={txn.type} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlaceholderPage({ label, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{label}</h3>
      <p className="text-gray-400 text-sm">This section is under construction. Check back soon!</p>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activePage, setPage, collapsed, setCollapsed }) {
  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? "w-16" : "w-52"} shrink-0`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        {!collapsed && <span className="text-gray-900 font-bold text-base tracking-tight">DashIQ</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-300 hover:text-gray-600 transition-colors text-lg shrink-0">
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Menu</p>}
        {NAV.map(({ label, icon, id }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activePage === id
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
            title={collapsed ? label : undefined}
          >
            <span className="text-base shrink-0">{icon}</span>
            {!collapsed && label}
          </button>
        ))}

        {!collapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mt-5 mb-2">Other Menu</p>}
        {collapsed && <div className="my-2 border-t border-gray-100" />}
        {OTHER_NAV.map(({ label, icon, id }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activePage === id
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
            title={collapsed ? label : undefined}
          >
            <span className="text-base shrink-0">{icon}</span>
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {/* User card */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">AD</div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">Admin User</p>
              <p className="text-[10px] text-gray-400 truncate">admin@dashiq.in</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ activePage }) {
  const PAGE_TITLES = {
    dashboard: "Dashboard",
    listing: "Listing",
    calendar: "Calendar",
    deals: "Deals",
    tracking: "Tracking",
    bids: "Active Bids",
    stats: "Statistics",
    transaction: "Transaction",
    support: "Support",
    settings: "Settings",
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center gap-4 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex-1 max-w-sm">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1" placeholder="Search listings, buyers…" />
      </div>

      {/* Nav pills */}
      <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
        {["Recent", "Buy", "Sell"].map((t) => (
          <button key={t} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${t === "Recent" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {["🎧", "⚙️", "🔔"].map((ic, i) => (
          <button key={i} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100 transition-colors relative">
            {ic}
            {ic === "🔔" && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">3</span>
            )}
          </button>
        ))}

        <div className="flex items-center gap-2 ml-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">AD</div>
          <span className="text-xs font-bold text-gray-700 hidden sm:block">Admin</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>
  );
}

// ─── Main Page Renderer ───────────────────────────────────────────────────────
function PageContent({ page, setPage }) {
  switch (page) {
    case "dashboard": return <DashboardPage setPage={setPage} />;
    case "listing": return <ListingPage />;
    case "bids": return <BidsPage />;
    case "transaction": return <TransactionPage />;
    case "calendar": return <PlaceholderPage label="Calendar" icon="📅" />;
    case "deals": return <PlaceholderPage label="Deals" icon="🤝" />;
    case "tracking": return <PlaceholderPage label="Tracking" icon="📍" />;
    case "stats": return <PlaceholderPage label="Statistics" icon="📊" />;
    case "support": return <PlaceholderPage label="Support" icon="🎧" />;
    case "settings": return <PlaceholderPage label="Settings" icon="⚙️" />;
    default: return <DashboardPage setPage={setPage} />;
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const PAGE_META = {
    dashboard: { title: "Dashboard", sub: "Get your latest update for the last 7 days" },
    listing: { title: "Listing", sub: "Manage your active car listings" },
    bids: { title: "Active Bids", sub: "Review and respond to incoming offers" },
    transaction: { title: "Transaction", sub: "Your complete sales history" },
    calendar: { title: "Calendar", sub: "Schedule viewings and meetings" },
    deals: { title: "Deals", sub: "Ongoing deal negotiations" },
    tracking: { title: "Tracking", sub: "Track your shipments and deliveries" },
    stats: { title: "Statistics", sub: "Insights and analytics for your listings" },
    support: { title: "Support", sub: "Get help when you need it" },
    settings: { title: "Settings", sub: "Manage your account preferences" },
  };

  const meta = PAGE_META[page] || PAGE_META.dashboard;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activePage={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar activePage={page} />

        {/* Page header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{meta.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{meta.sub}</p>
          </div>
          {page === "listing" ? null : (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-8">
          <PageContent page={page} setPage={setPage} />
        </main>
      </div>
    </div>
  );
}