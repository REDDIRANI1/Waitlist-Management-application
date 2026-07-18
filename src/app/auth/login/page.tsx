'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Catch OAuth errors from redirects
  useEffect(() => {
    const errCode = searchParams.get('error');
    if (errCode === 'method_mismatch') {
      setError('This email is registered via Google OAuth. Please log in using Google.');
    } else if (errCode === 'callback_error') {
      setError('Google Sign-in failed. Please try again.');
    } else if (errCode === 'token_exchange') {
      setError('Google token verification failed.');
    } else if (errCode === 'server_config') {
      setError('Google login is not fully configured in environment.');
    } else if (errCode === 'no_code') {
      setError('Authorization code missing.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
      } else {
        router.push('/apply');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google?target=user';
  };

  return (
    <div className="auth-card glass-card">
      <div className="auth-header text-center">
        <h1 className="auth-title text-gradient">Welcome Back</h1>
        <p className="auth-subtitle">Log in to manage your waitlist application.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <Mail className="input-icon" size={16} />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="form-input text-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-with-icon">
            <Lock className="input-icon" size={16} />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="form-input text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <button onClick={handleGoogleLogin} className="btn btn-google w-full">
        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        <span>Google OAuth</span>
      </button>

      <div className="auth-footer text-center mt-4">
        <span className="footer-text">Don&apos;t have an account? </span>
        <Link href="/auth/signup" className="btn-link">
          Sign Up
        </Link>
      </div>

      <style jsx>{`
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
        }

        .auth-header {
          margin-bottom: 24px;
        }

        .auth-title {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .input-with-icon {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .text-input {
          padding-left: 44px;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .auth-divider:not(:empty)::before {
          margin-right: .5em;
        }

        .auth-divider:not(:empty)::after {
          margin-left: .5em;
        }

        .google-icon {
          color: #db4437;
        }

        .footer-text {
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default function Login() {
  return (
    <div className="auth-page-container">
      <Suspense fallback={<div className="glass-card text-center">Loading authentication...</div>}>
        <LoginContent />
      </Suspense>
      <style jsx>{`
        .auth-page-container {
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
