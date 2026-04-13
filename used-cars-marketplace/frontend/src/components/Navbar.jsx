import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  .nav-root {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    height: 70px;
    background: rgba(8,8,8,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center;
    padding: 0 32px;
    gap: 32px;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; flex-shrink: 0;
  }
  .nav-logo-icon {
    width: 38px; height: 38px;
    background: #F59E0B; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(245,158,11,0.35);
  }
  .nav-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 2px; color: #fff;
  }
  .nav-logo-text span { color: #F59E0B; }

  .nav-links {
    display: flex; align-items: center; gap: 4px;
    flex: 1;
  }
  .nav-link {
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .nav-link.active { color: #F59E0B; }
  .nav-link.locked {
    color: rgba(255,255,255,0.25);
    cursor: not-allowed;
    position: relative;
  }
  .nav-link.locked::after {
    content: '🔒';
    font-size: 10px;
    margin-left: 4px;
    opacity: 0.6;
  }

  .nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

  .nav-post-btn {
    padding: 8px 18px;
    background: #F59E0B; border: none; border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 15px; letter-spacing: 1px;
    color: #000; cursor: pointer;
    transition: all 0.2s ease;
  }
  .nav-post-btn:hover { background: #fbbf24; transform: translateY(-1px); }

  .nav-icon-btn {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px;
    transition: all 0.2s;
    position: relative;
  }
  .nav-icon-btn:hover { background: rgba(255,255,255,0.1); }
  .nav-badge {
    position: absolute; top: -4px; right: -4px;
    width: 16px; height: 16px;
    background: #F59E0B; border-radius: 50%;
    font-size: 9px; font-weight: 700; color: #000;
    display: flex; align-items: center; justify-content: center;
  }

  .nav-signin-btn {
    padding: 8px 18px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-signin-btn:hover { border-color: rgba(245,158,11,0.4); color: #F59E0B; }

  .nav-avatar {
    width: 36px; height: 36px;
    background: #F59E0B; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; color: #000;
    cursor: pointer;
    border: 2px solid rgba(245,158,11,0.3);
  }

  .nav-logout-btn {
    padding: 7px 14px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
    font-size: 12px; font-weight: 500;
    color: rgba(239,68,68,0.7);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-logout-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
`;

// Pages where the navbar should be completely hidden
const HIDDEN_ON = ["/login", "/register", "/"];

// Links that require login
const NAV_LINKS = [
  { label: "Home",    path: "/home",              public: true  },
  { label: "Browse",  path: "/dashboard/buyer",   public: false },
  { label: "Compare", path: "/compare",           public: false },
  { label: "EMI Calc",path: "/emi",               public: false },
  { label: "Chatbot", path: "/chatbot",           public: false },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Hide navbar entirely on login / register pages ──
  if (HIDDEN_ON.includes(location.pathname)) return null;

  const handleProtectedLink = (link) => {
    if (!link.public && !user) {
      // Redirect to login instead of navigating
      navigate("/login");
      return;
    }
    navigate(link.path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <style>{STYLES}</style>
      <nav className="nav-root">

        
        {/* Nav Links */}
        <div className="nav-links">
          {NAV_LINKS.map((link) => {
            const locked = !link.public && !user;
            const active = location.pathname === link.path;
            return (
              <button
                key={link.path}
                className={`nav-link ${active ? "active" : ""} ${locked ? "locked" : ""}`}
                onClick={() => handleProtectedLink(link)}
                title={locked ? "Sign in to access" : ""}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {user ? (
            <>
              {/* Post listing — seller/admin only */}
              {(user.role === "seller" || user.role === "admin") && (
                <button className="nav-post-btn" onClick={() => navigate("/post-listing")}>
                  + Post Listing
                </button>
              )}

              {/* Notifications */}
              <div className="nav-icon-btn">
                🔔
                <span className="nav-badge">2</span>
              </div>

              {/* Wishlist */}
              <div className="nav-icon-btn">❤️</div>

              {/* Avatar */}
              <div className="nav-avatar" title={user.name} onClick={() => navigate(`/dashboard/${user.role}`)}>
                {initials}
              </div>

              {/* Logout */}
              <button className="nav-logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            /* Not logged in — only show Sign In, NO Register button */
            <button className="nav-signin-btn" onClick={() => navigate("/login")}>
              Sign In
            </button>
          )}
        </div>

      </nav>
    </>
  );
}