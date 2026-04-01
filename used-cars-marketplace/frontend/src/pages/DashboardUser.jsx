import { useState } from "react";

const cars = [
    {
        id: 1,
        seller: "Mulika Ielia",
        sellerImg: "https://i.pravatar.cc/40?img=47",
        name: "Blue Audi (PSD)",
        type: "Hatchback",
        transmission: "Auto",
        fuel: "Diesel",
        price: "348,98",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=80",
        color: "from-blue-100 to-blue-50",
    },
    {
        id: 2,
        seller: "Rabin",
        sellerImg: "https://i.pravatar.cc/40?img=12",
        name: "Bentley",
        type: "Hatchback",
        transmission: "Auto",
        fuel: "Diesel",
        price: "789,345",
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&q=80",
        color: "from-orange-100 to-amber-50",
    },
    {
        id: 3,
        seller: "Sarah K.",
        sellerImg: "https://i.pravatar.cc/40?img=32",
        name: "Tesla Model S",
        type: "Sedan",
        transmission: "Auto",
        fuel: "Electric",
        price: "999,00",
        image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=300&q=80",
        color: "from-slate-100 to-slate-50",
    },
    {
        id: 4,
        seller: "James R.",
        sellerImg: "https://i.pravatar.cc/40?img=68",
        name: "Porsche 911",
        type: "Coupe",
        transmission: "Manual",
        fuel: "Petrol",
        price: "1,200,00",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=80",
        color: "from-yellow-100 to-yellow-50",
    },
];

// const navItems = [
//     { label: "Dashboard", icon: DashboardIcon },
//     { label: "Listing", icon: ListingIcon, active: true },
//     { label: "Calendar", icon: CalendarIcon },
//     { label: "Deals", icon: DealsIcon },
//     { label: "Tracking", icon: TrackingIcon },
//     { label: "Active Bids", icon: BidsIcon },
//     { label: "Statistics", icon: StatsIcon },
//     { label: "Transaction", icon: TransactionIcon },
// ];

function DashboardIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={1.8} />
            <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={1.8} />
            <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={1.8} />
            <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={1.8} />
        </svg>
    );
}
function ListingIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.8} />
            <path d="M8 8h8M8 12h8M8 16h5" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
    );
}
function CalendarIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.8} />
            <path d="M16 2v4M8 2v4M3 10h18" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
    );
}
function DealsIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth={1.8} strokeLinejoin="round" />
        </svg>
    );
}
function TrackingIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 12h4l3-9 4 18 3-9h4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function BidsIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 20V10M18 20V4M6 20v-4" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
    );
}
function StatsIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 3v18h18" strokeWidth={1.8} strokeLinecap="round" />
            <path d="M7 16l4-4 4 4 4-6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function TransactionIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
            <path d="M12 7v5l3 3" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
    );
}

function CarCard({ car }) {
    const [bookmarked, setBookmarked] = useState(false);
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
            {/* Car Image */}
            <div className={`bg-gradient-to-br ${car.color} flex items-center justify-center h-44 px-4`}>
                <img
                    src={car.image}
                    alt={car.name}
                    className="h-36 w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                />
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col gap-3">
                {/* Seller */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={car.sellerImg} alt={car.seller} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow" />
                        <span className="text-sm font-semibold text-gray-700">{car.seller}</span>
                    </div>
                    <button
                        onClick={() => setBookmarked(!bookmarked)}
                        className={`p-1.5 rounded-lg transition-colors ${bookmarked ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
                    >
                        <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth={2} strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Car Name */}
                <h3 className="font-bold text-gray-900 text-base leading-tight">{car.name}</h3>

                {/* Tags */}
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 17H3a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2h-2M7 21h10M9 17v4M15 17v4" strokeWidth={2} />
                        </svg>
                        {car.type}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="9" strokeWidth={2} />
                            <path d="M12 8v4l2 2" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        {car.transmission}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeWidth={2} />
                            <circle cx="12" cy="9" r="2.5" strokeWidth={2} />
                        </svg>
                        {car.fuel}
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Price */}
                <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg tracking-tight">$ {car.price}</span>
                    <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        View
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DashboardUser() {
    // const [activeNav, setActiveNav] = useState("Listing");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("Reant");

    const filtered = cars.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">
            {/* Sidebar */}
            {/* <aside className="w-52 bg-white flex flex-col py-6 px-4 shadow-sm shrink-0"> */}
            {/* Logo */}
            {/* <div className="flex items-center gap-2.5 mb-8 px-1">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow">
                        D
                    </div> 
                    <span className="font-bold text-gray-900 text-lg tracking-tight">DasgggghIQ</span>
                </div> */}

            {/* Menu */}
            {/* <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3 px-1">Menu</p>
                {/* <nav className="flex flex-col gap-0.5">
                    {navItems.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => setActiveNav(label)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${activeNav === label
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                }`}
                        >
                            <Icon />
                            {label}
                        </button>
                    ))}
                </nav> */}

            {/* <div className="mt-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3 px-1">Other Menu</p>
            </div> */}

            {/* User at bottom */}
            {/* <div className="mt-auto flex items-center gap-2.5 px-1">
                <img src="https://i.pravatar.cc/40?img=5" alt="Admin" className="w-8 h-8 rounded-full object-cover" />
                <div>
                    <p className="text-xs font-semibold text-gray-800">Admin User</p>
                    <p className="text-[10px] text-gray-400">admin@dashiq.com</p>
                </div>
            </div> */}
            {/* //  </aside> */}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="bg-[#f5f5f0] px-8 py-4 flex items-center gap-4 shrink-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="11" cy="11" r="8" strokeWidth={2} />
                            <path d="M21 21l-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-white rounded-2xl px-1.5 py-1.5 shadow-sm border border-gray-100 ml-auto">
                        {["Rent", "Buy"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                    ? "bg-gray-900 text-white shadow"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition shadow-sm border border-gray-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M3 18v-6a9 9 0 0118 0v6" strokeWidth={2} />
                                <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" strokeWidth={2} />
                            </svg>
                        </button>
                        <button className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition shadow-sm border border-gray-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth={2} />
                            </svg>
                        </button>
                        <button className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition shadow-sm border border-gray-100 relative">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeWidth={2} />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>

                    {/* Admin */}
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition">
                        <img src="https://i.pravatar.cc/40?img=5" alt="Admin" className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-sm font-medium text-gray-700">Profile</span>
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M6 9l6 6 6-6" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 overflow-y-auto px-8 py-4">
                    {/* Page Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Listing</h1>
                            <p className="text-sm text-gray-400 mt-1">Get your latest update for the last 7 days</p>
                        </div>
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4 4-4-4M12 4v12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Export
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M6 9l6 6 6-6" strokeWidth={2} strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Available Cars Section */}
                    <div className="bg-white/60 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-gray-900 text-lg">Available Cars</h2>
                            <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-3 py-2 hover:bg-gray-50 transition shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M4 6h16M7 12h10M10 18h4" strokeWidth={2} strokeLinecap="round" />
                                </svg>
                                Filter by
                            </button>
                        </div>

                        {/* Car Grid */}
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered.map((car) => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
                                    <path d="M21 21l-4.35-4.35" strokeWidth={1.5} strokeLinecap="round" />
                                </svg>
                                <p className="text-sm font-medium">No cars found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}