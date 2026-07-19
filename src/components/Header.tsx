'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Shield, User, Menu, X, Landmark } from 'lucide-react';

interface AuthUser {
  userId: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Poll for auth status on pathname changes
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Header auth check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        // Redirect to login if on admin or apply routes
        if (pathname.startsWith('/admin')) {
          router.push('/admin/login');
        } else if (pathname.startsWith('/apply')) {
          router.push('/auth/login');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <header className="navbar-container">
      <div className="navbar-glow"></div>
      <nav className="navbar container">
        <Link href="/" className="nav-brand">
          <Landmark className="brand-icon" />
          <span>Waitlist Manager</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          {!isAdminRoute && (
            <Link href="/apply" className={`nav-link ${pathname === '/apply' ? 'active' : ''}`}>
              Join Waitlist
            </Link>
          )}

          {!loading && (
            <>
              {user ? (
                <div className="user-profile-menu">
                  {user.role === 'admin' ? (
                    <Link href="/admin/dashboard" className="admin-badge-link">
                      <Shield size={14} /> Admin
                    </Link>
                  ) : (
                    <div className="user-email-display">
                      <User size={14} /> <span>{user.email}</span>
                    </div>
                  )}
                  <button onClick={handleLogout} className="btn-logout-icon" title="Log Out">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  {isAdminRoute ? (
                    <Link href="/admin/login" className="btn btn-secondary">
                      Admin Login
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login" className="nav-link">
                        Login
                      </Link>
                      <Link href="/auth/signup" className="btn btn-primary">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-toggle">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Links Dropdown */}
      {menuOpen && (
        <div className="mobile-menu glass-card">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`mobile-link ${pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          {!isAdminRoute && (
            <Link
              href="/apply"
              onClick={() => setMenuOpen(false)}
              className={`mobile-link ${pathname === '/apply' ? 'active' : ''}`}
            >
              Join Waitlist
            </Link>
          )}

          {user ? (
            <div className="mobile-profile-section">
              <div className="mobile-user-details">
                <User size={16} />
                <span>{user.email}</span>
                {user.role === 'admin' && <span className="mobile-admin-tag">Admin</span>}
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary w-full"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              {isAdminRoute ? (
                <Link
                  href="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-secondary w-full"
                >
                  Admin Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-secondary w-full"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8, 12, 20, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          width: 100%;
        }

        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          text-decoration: none;
        }

        .brand-icon {
          color: var(--primary);
        }

        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none;
          }
        }

        .nav-link {
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: 500;
          transition: color var(--transition-fast);
          text-decoration: none;
        }

        .nav-link:hover, .nav-link.active {
          color: #ffffff;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px 14px;
          border-radius: var(--radius-full);
        }

        .user-email-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .admin-badge-link {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          font-size: 13px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: var(--radius-full);
          text-decoration: none;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .admin-badge-link:hover {
          background: rgba(99, 102, 241, 0.25);
        }

        .btn-logout-icon {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
        }

        .btn-logout-icon:hover {
          color: var(--error);
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .mobile-toggle {
            display: block;
          }
        }

        .mobile-menu {
          position: absolute;
          top: 80px;
          left: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
        }

        .mobile-link {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mobile-link:hover, .mobile-link.active {
          color: #ffffff;
        }

        .mobile-profile-section, .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
        }

        .mobile-user-details {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: var(--text-secondary);
          padding: 8px 0;
        }

        .mobile-admin-tag {
          font-size: 12px;
          font-weight: 600;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 1px 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </header>
  );
}
