'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = () => {
    // Starts Google OAuth redirect with target=admin state
    window.location.href = '/api/auth/google?target=admin';
  };

  return (
    <div className="admin-card glass-card text-center">
      <div className="admin-icon-wrapper">
        <Shield size={32} className="admin-icon" />
      </div>
      <h1 className="admin-title text-gradient">Admin Portal</h1>
      <p className="admin-subtitle">Secure access reserved for whitelisted administrators.</p>

      {error === 'unauthorized' && (
        <div className="alert alert-error text-left">
          <AlertCircle size={16} />
          <span>Access Denied: Only the whitelisted admin Google email is authorized.</span>
        </div>
      )}

      <button onClick={handleGoogleLogin} className="btn btn-primary w-full mt-4 btn-admin-google">
        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        <span>Login with Google OAuth</span>
      </button>

      <div className="admin-footer mt-8">
        <Link href="/" className="btn-link back-link">
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      <style jsx>{`
        .admin-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 8px 32px 0 rgba(99, 102, 241, 0.05);
        }

        .admin-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: var(--radius-full);
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          margin-bottom: 24px;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .admin-title {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .admin-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .btn-admin-google {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-muted);
        }

        .back-link:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <div className="admin-page-container">
      <Suspense fallback={<div className="glass-card text-center">Loading portal...</div>}>
        <AdminLoginContent />
      </Suspense>
      <style jsx>{`
        .admin-page-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
      `}</style>
    </div>
  );
}
