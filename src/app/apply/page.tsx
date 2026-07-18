'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, Mail, Phone, User, BookOpen, Layers, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  interestReason: string;
  useCase: string;
  emailStatus: string;
  phoneStatus: string;
  createdAt: string;
}

export default function Apply() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [interestReason, setInterestReason] = useState('');
  const [useCase, setUseCase] = useState('personal'); // default select value

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/waitlist/status');
      if (res.ok) {
        const data = await res.json();
        if (!data.loggedIn) {
          setAuthenticated(false);
          router.push('/auth/login');
        } else {
          setAuthenticated(true);
          if (data.hasSubmitted) {
            setHasSubmitted(true);
            setEntry(data.entry);
          } else {
            setHasSubmitted(false);
            setEmail(data.user.email);
            setFullName(data.user.name || '');
          }
        }
      }
    } catch (err) {
      console.error('Fetch waitlist status failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !phoneNumber || !interestReason || !useCase) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber, interestReason, useCase }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred during submission.');
      } else {
        setSuccess('Congratulations! You have successfully joined the early access waitlist.');
        setHasSubmitted(true);
        setEntry(data.entry);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-container container">
        <div className="glass-card text-center">
          <p className="loading-text">Loading application details...</p>
        </div>
        <style jsx>{`
          .apply-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 24px;
          }
          .loading-text {
            color: var(--text-secondary);
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  if (hasSubmitted && entry) {
    return (
      <div className="apply-container container">
        <div className="status-card glass-card">
          <div className="status-header text-center">
            <CheckCircle size={48} className="success-icon" />
            <h1 className="status-title text-gradient">You are on the Waitlist!</h1>
            <p className="status-subtitle">Thank you for applying. We are reviewing your registration details.</p>
          </div>

          <div className="entry-details">
            <h3 className="details-heading">Registration Summary</h3>
            <div className="details-grid">
              <div className="detail-item">
                <div className="item-label"><User size={14} /> Full Name</div>
                <div className="item-value">{entry.fullName}</div>
              </div>
              <div className="detail-item">
                <div className="item-label"><Mail size={14} /> Email ID</div>
                <div className="item-value">{entry.email}</div>
              </div>
              <div className="detail-item">
                <div className="item-label"><Phone size={14} /> Phone Number</div>
                <div className="item-value">{entry.phoneNumber}</div>
              </div>
              <div className="detail-item">
                <div className="item-label"><Layers size={14} /> Intended Use Case</div>
                <div className="item-value capitalize">{entry.useCase}</div>
              </div>
              <div className="detail-item full-width">
                <div className="item-label"><BookOpen size={14} /> Interest Reason</div>
                <div className="item-value reason-text">{entry.interestReason}</div>
              </div>
            </div>
          </div>

          {/* Validation indicators */}
          <div className="verification-badges">
            <div className="verification-badge-item">
              <span>Email Valid:</span>
              <span className={`badge badge-${entry.emailStatus}`}>{entry.emailStatus}</span>
            </div>
            <div className="verification-badge-item">
              <span>Phone Valid:</span>
              <span className={`badge badge-${entry.phoneStatus}`}>{entry.phoneStatus}</span>
            </div>
            <div className="verification-badge-item text-muted-row">
              <Clock size={12} />
              <span>Applied: {new Date(entry.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .apply-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 24px;
          }

          .status-card {
            width: 100%;
            max-width: 600px;
          }

          .status-header {
            margin-bottom: 32px;
          }

          .success-icon {
            color: var(--success);
            margin-bottom: 16px;
          }

          .status-title {
            font-size: 32px;
            margin-bottom: 8px;
          }

          .status-subtitle {
            color: var(--text-secondary);
            font-size: 15px;
          }

          .entry-details {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-md);
            padding: 24px;
            margin-bottom: 24px;
          }

          .details-heading {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #ffffff;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 8px;
          }

          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          @media (max-width: 480px) {
            .details-grid {
              grid-template-columns: 1fr;
            }
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .detail-item.full-width {
            grid-column: span 2;
          }

          @media (max-width: 480px) {
            .detail-item.full-width {
              grid-column: span 1;
            }
          }

          .item-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .item-value {
            font-size: 14px;
            color: var(--text-primary);
            font-weight: 500;
          }

          .reason-text {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: var(--radius-sm);
            padding: 8px 12px;
            font-weight: 400;
            line-height: 1.5;
            color: var(--text-secondary);
            word-break: break-word;
          }

          .verification-badges {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 0 8px;
          }

          .verification-badge-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .text-muted-row {
            color: var(--text-muted) !important;
            font-size: 12px;
            gap: 4px;
            width: 100%;
            justify-content: flex-end;
            margin-top: 8px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="apply-container container">
      <div className="form-card glass-card">
        <div className="form-header text-center">
          <h1 className="form-title text-gradient">Early Access Request</h1>
          <p className="form-subtitle">Fill in the application form to secure your spot.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="waitlist-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={16} />
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="form-input text-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  id="email"
                  type="email"
                  className="form-input text-input"
                  value={email}
                  disabled // Pre-filled from authenticated account to prevent spoofing
                />
              </div>
              <span className="input-hint">Associated with your account</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">Indian Mobile Number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={16} />
                <input
                  id="phoneNumber"
                  type="text"
                  placeholder="+91 98765 43210"
                  className="form-input text-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="useCase">Use Case</label>
              <select
                id="useCase"
                className="form-input form-select"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                required
              >
                <option value="personal">Personal / Hobbyist</option>
                <option value="startup">Startup / Growth Stage</option>
                <option value="enterprise">Enterprise Organization</option>
                <option value="educational">Academic / Educational</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="interestReason">Why are you interested in Antigravity?</label>
            <textarea
              id="interestReason"
              placeholder="Tell us about your project, target audience, or why you want early access..."
              className="form-input form-textarea"
              value={interestReason}
              onChange={(e) => setInterestReason(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={submitting}>
            {submitting ? 'Submitting Request...' : 'Submit Application'}
            <Send size={14} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .apply-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .form-card {
          width: 100%;
          max-width: 680px;
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .form-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
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

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 20px;
          padding-right: 40px;
        }

        .input-hint {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
          text-align: left;
        }
      `}</style>
    </div>
  );
}
