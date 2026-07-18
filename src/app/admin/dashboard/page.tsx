'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, SlidersHorizontal, RefreshCw, CheckCircle2, 
  XCircle, HelpCircle, Calendar, Shield, Users, MailCheck, PhoneCall 
} from 'lucide-react';

interface WaitlistEntry {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  interestReason: string;
  useCase: string;
  createdAt: string;
  authMethod: string;
  emailStatus: 'valid' | 'invalid' | 'approved';
  phoneStatus: 'valid' | 'invalid' | 'approved';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterEmailStatus, setFilterEmailStatus] = useState('all');
  const [filterUseCase, setFilterUseCase] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    validEmails: 0,
    validPhones: 0,
    googleAuth: 0,
    credentialsAuth: 0
  });

  const checkAuthAndFetchData = async (querySearch = search) => {
    try {
      // 1. Verify user details
      const meRes = await fetch('/api/me');
      if (!meRes.ok) {
        router.push('/admin/login');
        return;
      }
      
      const meData = await meRes.json();
      if (!meData.authenticated || meData.user.role !== 'admin') {
        router.push('/admin/login');
        return;
      }

      // 2. Fetch submissions
      const listUrl = `/api/waitlist/admin/list?search=${encodeURIComponent(querySearch)}`;
      const listRes = await fetch(listUrl);
      if (!listRes.ok) {
        if (listRes.status === 403) {
          router.push('/admin/unauthorized');
        }
        return;
      }

      const listData = await listRes.json();
      if (listData.success) {
        setEntries(listData.entries);
        calculateStats(listData.entries);
      }
    } catch (err) {
      console.error('Fetch data failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: WaitlistEntry[]) => {
    const total = data.length;
    const validEmails = data.filter(e => e.emailStatus === 'valid' || e.emailStatus === 'approved').length;
    const validPhones = data.filter(e => e.phoneStatus === 'valid' || e.phoneStatus === 'approved').length;
    const googleAuth = data.filter(e => e.authMethod === 'google').length;
    const credentialsAuth = data.filter(e => e.authMethod === 'credentials').length;

    setStats({ total, validEmails, validPhones, googleAuth, credentialsAuth });
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    // Debounce or immediate search
    checkAuthAndFetchData(value);
  };

  const handleStatusUpdate = async (entryId: string, field: 'emailStatus' | 'phoneStatus', currentStatus: string) => {
    // Cycles statuses: valid -> approved -> invalid -> valid
    let nextStatus: 'valid' | 'invalid' | 'approved' = 'valid';
    if (currentStatus === 'valid') nextStatus = 'approved';
    else if (currentStatus === 'approved') nextStatus = 'invalid';
    else nextStatus = 'valid';

    setUpdatingId(`${entryId}-${field}`);
    try {
      const res = await fetch('/api/waitlist/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, field, status: nextStatus }),
      });

      if (res.ok) {
        // Optimistically update local state to avoid full re-fetch
        setEntries(prev => prev.map(entry => {
          if (entry.id === entryId) {
            return { ...entry, [field]: nextStatus };
          }
          return entry;
        }));
        
        // Recalculate statistics from updated state
        setEntries(currentEntries => {
          calculateStats(currentEntries);
          return currentEntries;
        });
      }
    } catch (err) {
      console.error('Update status failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Client side filtering for UI
  const filteredEntries = entries.filter(entry => {
    const matchesEmailStatus = filterEmailStatus === 'all' || entry.emailStatus === filterEmailStatus;
    const matchesUseCase = filterUseCase === 'all' || entry.useCase === filterUseCase;
    return matchesEmailStatus && matchesUseCase;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />;
      case 'valid':
        return <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />;
      case 'invalid':
        return <XCircle size={14} style={{ color: 'var(--error)' }} />;
      default:
        return <HelpCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading container">
        <div className="glass-card text-center">
          <RefreshCw size={24} className="spin-icon" />
          <p>Verifying administrative credentials...</p>
        </div>
        <style jsx>{`
          .dashboard-loading {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 24px;
          }
          .spin-icon {
            animation: spin 1.5s linear infinite;
            margin-bottom: 12px;
            color: var(--primary);
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-tag">
            <Shield size={12} />
            <span>Admin Console</span>
          </div>
          <h1 className="dashboard-title text-gradient">Waitlist Dashboard</h1>
        </div>
        <button onClick={() => checkAuthAndFetchData()} className="btn btn-secondary btn-refresh">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper purple"><Users size={20} /></div>
          <div>
            <div className="stat-label">Total Applications</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper green"><MailCheck size={20} /></div>
          <div>
            <div className="stat-label">Valid Emails</div>
            <div className="stat-value">{stats.validEmails}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper cyan"><PhoneCall size={20} /></div>
          <div>
            <div className="stat-label">Valid Phone Numbers</div>
            <div className="stat-value">{stats.validPhones}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-label-dual">OAuth / Password</div>
          <div className="stat-value-dual">
            <span className="oauth-val">{stats.googleAuth} G</span>
            <span className="divider-val">/</span>
            <span className="pass-val">{stats.credentialsAuth} P</span>
          </div>
        </div>
      </section>

      {/* Controls: Search and Filters */}
      <section className="controls-card glass-card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by applicant name, email, or phone number..."
            className="form-input search-input"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <SlidersHorizontal size={14} className="filter-icon" />
            <span className="filter-label">Filter by:</span>
          </div>

          <select
            className="form-input filter-select"
            value={filterEmailStatus}
            onChange={(e) => setFilterEmailStatus(e.target.value)}
          >
            <option value="all">All Email Statuses</option>
            <option value="valid">Valid</option>
            <option value="invalid">Invalid</option>
            <option value="approved">Approved</option>
          </select>

          <select
            className="form-input filter-select"
            value={filterUseCase}
            onChange={(e) => setFilterUseCase(e.target.value)}
          >
            <option value="all">All Use Cases</option>
            <option value="personal">Personal / Hobbyist</option>
            <option value="startup">Startup</option>
            <option value="enterprise">Enterprise</option>
            <option value="educational">Educational</option>
          </select>
        </div>
      </section>

      {/* Entries Table */}
      <section className="table-card glass-card">
        <div className="table-responsive">
          <table className="entries-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Contact Information</th>
                <th>Interest Reason</th>
                <th>Auth Method</th>
                <th>Email Status</th>
                <th>Phone Status</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="applicant-name">{entry.fullName}</div>
                      <div className="use-case-tag capitalize">{entry.useCase}</div>
                    </td>
                    <td>
                      <div className="contact-email">{entry.email}</div>
                      <div className="contact-phone">{entry.phoneNumber}</div>
                    </td>
                    <td>
                      <div className="interest-reason-box" title={entry.interestReason}>
                        {entry.interestReason}
                      </div>
                    </td>
                    <td>
                      <span className={`auth-badge ${entry.authMethod}`}>
                        {entry.authMethod === 'google' ? 'Google' : 'Credentials'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusUpdate(entry.id, 'emailStatus', entry.emailStatus)}
                        disabled={updatingId === `${entry.id}-emailStatus`}
                        className={`btn-status-badge badge-${entry.emailStatus}`}
                        title="Click to cycle status"
                      >
                        {getStatusIcon(entry.emailStatus)}
                        <span>{entry.emailStatus}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusUpdate(entry.id, 'phoneStatus', entry.phoneStatus)}
                        disabled={updatingId === `${entry.id}-phoneStatus`}
                        className={`btn-status-badge badge-${entry.phoneStatus}`}
                        title="Click to cycle status"
                      >
                        {getStatusIcon(entry.phoneStatus)}
                        <span>{entry.phoneStatus}</span>
                      </button>
                    </td>
                    <td>
                      <div className="applied-time">
                        <Calendar size={12} />
                        <span>
                          {new Date(entry.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-records-row">
                    No early access registrations match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .dashboard-container {
          padding-top: 40px;
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          flex: 1;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.2);
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .dashboard-title {
          font-size: 36px;
        }

        .btn-refresh {
          height: 42px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
        }

        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-wrapper.purple {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .stat-icon-wrapper.green {
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .stat-icon-wrapper.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          font-family: var(--font-display);
        }

        .stat-label-dual {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          width: 100%;
          text-align: left;
        }

        .stat-value-dual {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: 22px;
          font-weight: 700;
          font-family: var(--font-display);
          margin-top: 4px;
        }

        .oauth-val { color: #818cf8; }
        .pass-val { color: var(--text-secondary); }
        .divider-val { color: var(--text-muted); font-size: 16px; }

        /* Controls */
        .controls-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
        }

        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 48px;
          background: rgba(8, 12, 20, 0.5);
        }

        .filters-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
        }

        .filter-select {
          width: auto;
          min-width: 160px;
          padding: 8px 16px;
          font-size: 13px;
          height: 38px;
          background: rgba(8, 12, 20, 0.3);
        }

        /* Table CSS */
        .table-card {
          padding: 0;
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }

        .entries-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .entries-table th {
          background: rgba(15, 23, 42, 0.4);
          color: var(--text-secondary);
          font-weight: 600;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
        }

        .entries-table td {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .entries-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }

        .applicant-name {
          font-weight: 600;
          color: #ffffff;
        }

        .use-case-tag {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .contact-email {
          color: var(--text-primary);
          font-weight: 500;
        }

        .contact-phone {
          color: var(--text-secondary);
          font-size: 13px;
          margin-top: 2px;
        }

        .interest-reason-box {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-secondary);
          cursor: help;
        }

        .auth-badge {
          display: inline-flex;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .auth-badge.google {
          background: rgba(219, 68, 55, 0.1);
          color: #fca5a5;
        }

        .auth-badge.credentials {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
        }

        .btn-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          background: none;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .btn-status-badge:hover {
          transform: scale(1.05);
        }

        .btn-status-badge.badge-valid {
          background-color: var(--success-bg);
          border: 1px solid var(--success-border);
          color: var(--success);
        }

        .btn-status-badge.badge-approved {
          background-color: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: var(--accent);
        }

        .btn-status-badge.badge-invalid {
          background-color: var(--error-bg);
          border: 1px solid var(--error-border);
          color: var(--error);
        }

        .applied-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .no-records-row {
          text-align: center;
          color: var(--text-muted);
          padding: 40px !important;
        }
      `}</style>
    </div>
  );
}
