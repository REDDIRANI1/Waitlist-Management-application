'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated);
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Now in Early Access</span>
        </div>
        <h1 className="hero-title text-gradient">
          The Next Generation of <br />
          <span className="text-cyan-gradient">Waitlist Management</span>
        </h1>
        <p className="hero-subtitle">
          Supercharge your launch. Verify user contacts with server-side MX record checks and Indian mobile validations, support both Google OAuth & passwords, and manage accounts through an elegant admin dashboard.
        </p>
        <div className="hero-actions">
          <Link href={isAuthenticated ? '/apply' : '/auth/signup'} className="btn btn-primary btn-lg">
            <span>Get Started</span>
            <ArrowRight size={16} />
          </Link>
          <Link href={isAuthenticated ? '/apply' : '/auth/login'} className="btn btn-secondary btn-lg">
            Log In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features container">
        <div className="section-header text-center">
          <h2 className="section-title">Built with Precision</h2>
          <p className="section-subtitle">A robust, premium architectural foundation for managing user acquisitions.</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper purple">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-name">Intelligent Verification</h3>
            <p className="feature-description">
              Automatic validation using server-side DNS MX record resolutions, temporary/disposable domain filters, and Indian mobile format checks to filter out dummy submissions.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper cyan">
              <Zap size={24} />
            </div>
            <h3 className="feature-name">Unified Authentication</h3>
            <p className="feature-description">
              Integrated user registry. Secure login via Google OAuth 2.0 or local credentials, preventing profile duplications and session collision.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper green">
              <Layers size={24} />
            </div>
            <h3 className="feature-name">Admin Dashboard</h3>
            <p className="feature-description">
              Protected by administrative Google account authorization. Search, filter, inspect registration records, and manually approve validation overrides in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Decorative footer */}
      <footer className="footer text-center">
        <p>&copy; {new Date().getFullYear()} Waitlist Manager. All rights reserved.</p>
      </footer>

      <style jsx>{`
        .home-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-top: 60px;
        }

        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 800px;
          margin-bottom: 80px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 600;
          color: #a5b4fc;
          margin-bottom: 24px;
          animation: pulse 2s infinite alternate;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); }
          100% { box-shadow: 0 0 12px 2px rgba(99, 102, 241, 0.4); }
        }

        .badge-icon {
          color: #818cf8;
        }

        .hero-title {
          font-size: 56px;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 40px;
          }
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 680px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          width: 100%;
        }

        @media (max-width: 480px) {
          .hero-actions {
            flex-direction: column;
            padding: 0 16px;
          }
        }

        .btn-lg {
          padding: 14px 32px;
          font-size: 16px;
        }

        /* Features Section */
        .features {
          margin-bottom: 100px;
        }

        .section-header {
          margin-bottom: 48px;
        }

        .section-title {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 32px;
        }

        .feature-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
        }

        .feature-icon-wrapper.purple {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .feature-icon-wrapper.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .feature-icon-wrapper.green {
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .feature-name {
          font-size: 20px;
          margin-bottom: 12px;
          color: #ffffff;
        }

        .feature-description {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .footer {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 14px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
