'use client';

import { ShieldAlert, ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="unauth-page-container">
      <div className="unauth-card glass-card text-center">
        <div className="unauth-icon-wrapper">
          <ShieldAlert size={36} />
        </div>
        <h1 className="unauth-title text-gradient">Access Denied</h1>
        <p className="unauth-subtitle">
          Only the whitelisted administrator email address is authorized to access the Admin Dashboard.
        </p>

        <div className="alert alert-error text-left">
          <span>
            You have successfully authenticated with Google, but your email is not registered in the administrator database.
          </span>
        </div>

        <div className="unauth-actions">
          <Link href="/admin/login" className="btn btn-primary">
            <RotateCcw size={14} />
            <span>Try Another Account</span>
          </Link>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .unauth-page-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .unauth-card {
          width: 100%;
          max-width: 460px;
          padding: 40px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          box-shadow: 0 8px 32px 0 rgba(239, 68, 68, 0.05);
        }

        .unauth-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: var(--radius-full);
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          margin-bottom: 24px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .unauth-title {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .unauth-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .unauth-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          justify-content: center;
        }

        @media (max-width: 480px) {
          .unauth-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
