import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminNavStats, getBuyerNavStats, getSellerNavStats } from "../api";

const BUYER_SECTIONS = [
  {
    title: "Main",
    items: [
      { icon: "🏠", label: "Dashboard", href: "/dashboard/buyer" },
      { icon: "🔍", label: "Browse Cars", href: "/browse" },
    ],
  },
  {
    title: "My Activity",
    items: [
      { icon: "❤️", label: "Wishlist", href: "/wishlist" },
      { icon: "💬", label: "Messages", href: "/messages" },
      { icon: "🏷️", label: "My Bids", href: "/bids" },
      { icon: "💰", label: "My Offers", href: "/offers" },
    ],
  },
  {
    title: "Tools",
    items: [
      { icon: "⚖️", label: "Compare Cars", href: "/compare" },
      { icon: "🧮", label: "EMI Calculator", href: "/emi" },
      { icon: "🤖", label: "AI Chatbot", href: "/chatbot", badge: "AI" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "👤", label: "Profile", href: "/profile" },
      { icon: "⚙️", label: "Settings", href: "/settings" },
    ],
  },
];

const SELLER_SECTIONS = [
  {
    title: "Main",
    items: [
      { icon: "🏠", label: "Dashboard", href: "/dashboard/seller" },
      { icon: "🚗", label: "My Listings", href: "/my-listings" },
      { icon: "➕", label: "Add Listing", href: "/add-listing" },
    ],
  },
  {
    title: "Activity",
    items: [
      { icon: "⚡", label: "Incoming Bids", href: "/bids" },
      { icon: "💬", label: "Messages", href: "/messages" },
      { icon: "📊", label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Tools",
    items: [
      { icon: "🧮", label: "EMI Calculator", href: "/emi" },
      { icon: "⚖️", label: "Compare Cars", href: "/compare" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "👤", label: "Profile", href: "/profile" },
      { icon: "⚙️", label: "Settings", href: "/settings" },
      { icon: "🛡️", label: "Verification", href: "/verify" },
    ],
  },
];

const ADMIN_SECTIONS = [
  {
    title: "Control Center",
    items: [
      { icon: "📊", label: "Overview", href: "/dashboard/admin" },
      { icon: "🛡️", label: "Approvals", href: "/approvals" },
      { icon: "⚠️", label: "Fraud Alerts", href: "/fraud" },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: "👥", label: "All Users", href: "/admin/users" },
      { icon: "🚗", label: "All Listings", href: "/admin/listings" },
      { icon: "💹", label: "Revenue", href: "/admin/revenue" },
      { icon: "💬", label: "Messages", href: "/messages" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: "⚙️", label: "Settings", href: "/admin/settings" },
      { icon: "📋", label: "Audit Log", href: "/admin/audit" },
    ],
  },
];

export default function Sidebar({ role: roleProp, collapsed: collapsedProp = false, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsedProp);
  const [adminStats, setAdminStats] = useState({ approvals: 0, fraud_alerts: 0, messages: 0 });
  const [sellerStats, setSellerStats] = useState({ total_listings: 0, incoming_bids_new: 0, unread_messages: 0, needs_verification: false });
  const [buyerStats, setBuyerStats] = useState({ wishlist_items: 0, open_messages: 0, active_bids: 0, offers_total: 0 });

  const role = String(roleProp || user?.role || "buyer").toLowerCase();

  useEffect(() => {
    const loadStats = async () => {
      if (role === "admin") {
        try {
          const res = await getAdminNavStats();
          setAdminStats({
            approvals: Number(res.data?.approvals || 0),
            fraud_alerts: Number(res.data?.fraud_alerts || 0),
            messages: Number(res.data?.messages || 0),
          });
        } catch {
          setAdminStats({ approvals: 0, fraud_alerts: 0, messages: 0 });
        }
      }

      if (role === "seller") {
        try {
          const res = await getSellerNavStats();
          setSellerStats({
            total_listings: Number(res.data?.total_listings || 0),
            incoming_bids_new: Number(res.data?.incoming_bids_new || 0),
            unread_messages: Number(res.data?.unread_messages || 0),
            needs_verification: Boolean(res.data?.needs_verification),
          });
        } catch {
          setSellerStats({ total_listings: 0, incoming_bids_new: 0, unread_messages: 0, needs_verification: false });
        }
      }

      if (role === "buyer") {
        try {
          const res = await getBuyerNavStats();
          setBuyerStats({
            wishlist_items: Number(res.data?.wishlist_items || 0),
            open_messages: Number(res.data?.open_messages || 0),
            active_bids: Number(res.data?.active_bids || 0),
            offers_total: Number(res.data?.offers_total || 0),
          });
        } catch {
          setBuyerStats({ wishlist_items: 0, open_messages: 0, active_bids: 0, offers_total: 0 });
        }
      }
    };
    loadStats();
  }, [role]);

  const withAdminBadges = (inputSections) => {
    if (role !== "admin") return inputSections;
    return inputSections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.href === "/approvals") return { ...item, badge: String(adminStats.approvals || 0) };
        if (item.href === "/fraud") return { ...item, badge: String(adminStats.fraud_alerts || 0) };
        if (item.href === "/messages") return { ...item, badge: String(adminStats.messages || 0) };
        return item;
      }),
    }));
  };

  const withSellerBadges = (inputSections) => {
    if (role !== "seller") return inputSections;
    return inputSections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.href === "/my-listings") return { ...item, badge: String(sellerStats.total_listings || 0) };
        if (item.href === "/bids") return { ...item, badge: String(sellerStats.incoming_bids_new || 0) };
        if (item.href === "/messages") return { ...item, badge: String(sellerStats.unread_messages || 0) };
        if (item.href === "/verify") return { ...item, badge: sellerStats.needs_verification ? "!" : "" };
        return item;
      }),
    }));
  };

  const withBuyerBadges = (inputSections) => {
    if (role !== "buyer") return inputSections;
    return inputSections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.href === "/wishlist") return { ...item, badge: String(buyerStats.wishlist_items || 0) };
        if (item.href === "/messages") return { ...item, badge: String(buyerStats.open_messages || 0) };
        if (item.href === "/bids") return { ...item, badge: String(buyerStats.active_bids || 0) };
        if (item.href === "/offers") return { ...item, badge: String(buyerStats.offers_total || 0) };
        return item;
      }),
    }));
  };

  const sections =
    role === "admin" ? withAdminBadges(ADMIN_SECTIONS) :
    role === "seller" ? withSellerBadges(SELLER_SECTIONS) :
    withBuyerBadges(BUYER_SECTIONS);

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    onToggle?.(next);
  };

  const isActive = (href) => location.pathname === href;

  const sidebarWidth = isCollapsed ? 72 : 260;

  const badgeClass = (badge) => {
    if (badge === "AI") return "text-ai";
    if (badge === "!") return "alert";
    if (badge === "New") return "text-new";
    return "number";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .sb-root {
          position: fixed;
          top: 70px; left: 0; bottom: 0;
          background: #0a0a0a;
          border-right: 1px solid rgba(245,158,11,0.1);
          display: flex;
          flex-direction: column;
          z-index: 900;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .sb-root::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 220px;
          background: radial-gradient(ellipse at top left, rgba(245,158,11,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .sb-header {
          height: 70px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }

        .sb-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; overflow: hidden; white-space: nowrap; cursor: pointer;
        }

        .sb-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 10px; display: flex; align-items: center;
          justify-content: center; font-size: 17px; flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(245,158,11,0.3);
        }

        .sb-logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 2px; color: #fff;
        }
        .sb-logo-text span { color: #f59e0b; }

        .sb-toggle {
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          transition: all 0.2s; flex-shrink: 0;
          color: rgba(255,255,255,0.4); font-size: 11px;
        }
        .sb-toggle:hover {
          background: rgba(245,158,11,0.1);
          border-color: rgba(245,158,11,0.3); color: #f59e0b;
        }

        .sb-user {
          margin: 10px; padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; display: flex; align-items: center;
          gap: 10px; flex-shrink: 0; overflow: hidden;
          transition: all 0.3s; cursor: pointer;
        }
        .sb-user:hover {
          background: rgba(245,158,11,0.05);
          border-color: rgba(245,158,11,0.15);
        }

        .sb-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #92400e);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #fff;
          flex-shrink: 0; position: relative;
        }

        .sb-online {
          position: absolute; bottom: -2px; right: -2px;
          width: 9px; height: 9px; background: #22c55e;
          border-radius: 50%; border: 2px solid #0a0a0a;
        }

        .sb-user-info { overflow: hidden; flex: 1; white-space: nowrap; }
        .sb-user-name { font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; }
        .sb-user-role { font-size: 11px; color: #f59e0b; font-weight: 600; margin-top: 1px; text-transform: capitalize; }

        .sb-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 6px 0; }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 3px; }

        .sb-section-title {
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
          padding: 14px 18px 6px; white-space: nowrap;
        }

        .sb-item {
          position: relative; display: flex; align-items: center;
          gap: 11px; margin: 2px 8px; border-radius: 10px;
          text-decoration: none; color: rgba(255,255,255,0.6);
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap;
          border: 1px solid transparent;
        }
        .sb-item:hover { background: rgba(245,158,11,0.08); color: rgba(255,255,255,0.9); }
        .sb-item.active {
          background: rgba(245,158,11,0.12); color: #f59e0b;
          border-color: rgba(245,158,11,0.15);
        }
        .sb-item.active::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; background: #f59e0b; border-radius: 0 3px 3px 0;
        }

        .sb-icon { font-size: 17px; flex-shrink: 0; width: 20px; text-align: center; }

        .sb-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
        .sb-badge.number { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .sb-badge.text-new { background: rgba(34,197,94,0.15); color: #22c55e; }
        .sb-badge.text-ai { background: rgba(139,92,246,0.15); color: #8b5cf6; }
        .sb-badge.alert { background: rgba(239,68,68,0.15); color: #ef4444; }

        .sb-tooltip {
          display: none; position: absolute; left: calc(100% + 10px); top: 50%;
          transform: translateY(-50%); background: rgba(20,20,20,0.98);
          border: 1px solid rgba(245,158,11,0.2); color: #fff;
          font-size: 13px; padding: 6px 12px; border-radius: 8px;
          white-space: nowrap; pointer-events: none; z-index: 1000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .sb-tooltip::before {
          content: ''; position: absolute; right: 100%; top: 50%;
          transform: translateY(-50%); border: 5px solid transparent;
          border-right-color: rgba(245,158,11,0.2);
        }
        .sb-root.collapsed .sb-item:hover .sb-tooltip { display: block; }

        .sb-bottom { padding: 10px; border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }

        .sb-post-btn {
          width: 100%; background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none; border-radius: 12px; color: #000;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
          cursor: pointer; transition: all 0.2s; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 15px rgba(245,158,11,0.3);
          overflow: hidden; white-space: nowrap; margin-bottom: 6px;
        }
        .sb-post-btn:hover { box-shadow: 0 6px 25px rgba(245,158,11,0.5); transform: translateY(-1px); }

        .sb-logout {
          display: flex; align-items: center; gap: 11px;
          border-radius: 10px; color: rgba(255,255,255,0.35);
          font-size: 13px; cursor: pointer; transition: all 0.2s;
          border: 1px solid transparent;
        }
        .sb-logout:hover { color: #ef4444; background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.1); }
      `}</style>

      <aside
        className={`sb-root ${isCollapsed ? "collapsed" : ""}`}
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="sb-header">
          <div className="sb-logo" onClick={() => navigate("/")}>
            <div className="sb-logo-icon">🚗</div>
            {!isCollapsed && (
              <span className="sb-logo-text">
                Auto<span>Xpert</span>
              </span>
            )}
          </div>
          <button className="sb-toggle" onClick={toggle}>
            {isCollapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User card */}
        <div className="sb-user" onClick={() => navigate("/profile")}>
          <div className="sb-avatar">
            {user?.avatar || user?.full_name?.[0] || user?.name?.[0] || "U"}
            <div className="sb-online" />
          </div>
          {!isCollapsed && (
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.full_name || user?.name || "Guest"}</div>
              <div className="sb-user-role">{role}</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="sb-scroll">
          {sections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && <div className="sb-section-title">{section.title}</div>}
              {section.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`sb-item ${isActive(item.href) ? "active" : ""}`}
                  style={{
                    padding: isCollapsed ? "11px 0" : "10px 12px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  onClick={(e) => { e.preventDefault(); navigate(item.href); }}
                >
                  <span className="sb-icon">{item.icon}</span>
                  {!isCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {item.badge && !isCollapsed && (
                    <span className={`sb-badge ${badgeClass(item.badge)}`}>{item.badge}</span>
                  )}
                  <span className="sb-tooltip">{item.label}</span>
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="sb-bottom">
          {role === "seller" && (
            <button
              className="sb-post-btn"
              style={{ padding: isCollapsed ? "11px 0" : "11px 14px" }}
              onClick={() => navigate("/add-listing")}
            >
              <span>+</span>
              {!isCollapsed && <span>Post a Listing</span>}
            </button>
          )}
          <div
            className="sb-logout"
            style={{
              padding: isCollapsed ? "10px 0" : "9px 12px",
              justifyContent: isCollapsed ? "center" : "flex-start",
            }}
            onClick={() => { logout?.(); navigate("/"); }}
          >
            <span style={{ fontSize: 17 }}>🚪</span>
            {!isCollapsed && <span>Sign Out</span>}
            <span className="sb-tooltip">Sign Out</span>
          </div>
        </div>
      </aside>
    </>
  );
}