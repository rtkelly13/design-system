import React, { useState } from 'react';
import { LayoutDashboard, FileText, Sliders, LineChart, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { useTheme } from '../ThemeProvider';

export interface AdminNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

export const DEFAULT_ADMIN_NAV: AdminNavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={18} /> },
  { id: 'reconciliation', label: 'RECONCILIATION', icon: <FileText size={18} />, badgeCount: 3 },
  { id: 'rules', label: 'RULE ENGINE', icon: <Sliders size={18} /> },
  { id: 'cashflow', label: 'CASHFLOW FORECAST', icon: <LineChart size={18} /> },
  { id: 'backups', label: 'DRIVE BACKUPS', icon: <Database size={18} /> },
];

export interface AdminDashboardLayoutProps {
  appTitle?: string;
  navItems?: AdminNavItem[];
  activeNavId?: string;
  onNavSelect?: (id: string) => void;
  children?: React.ReactNode;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  appTitle = "YNAB COMPANION ADMIN",
  navItems = DEFAULT_ADMIN_NAV,
  activeNavId = 'dashboard',
  onNavSelect,
  children,
}) => {
  const [currentNav, setCurrentNav] = useState(activeNavId);
  const { theme, cycleTheme } = useTheme();

  const handleSelect = (id: string) => {
    setCurrentNav(id);
    if (onNavSelect) onNavSelect(id);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-black, #000000)',
        color: 'var(--color-white, #ffffff)',
        fontFamily: 'var(--font-inter, "Inter"), sans-serif',
      }}
    >
      {/* 1. BRUTALIST SIDEBAR */}
      <aside
        style={{
          width: '280px',
          borderRight: '3px solid var(--border-color, #ffffff)',
          backgroundColor: 'var(--color-black, #000000)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem',
        }}
      >
        <div>
          {/* Logo Branding */}
          <div style={{ marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border-color, #ffffff)' }}>
            <h1
              style={{
                fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                fontSize: '1.2rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                margin: 0,
                color: 'var(--brutalist-cyan, #22d3ee)',
                letterSpacing: '-0.02em',
              }}
            >
              [ {appTitle} ]
            </h1>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.75rem', color: 'var(--brutalist-yellow, #facc15)' }}>
              v1.2.0 • SINGLE-PLAYER
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {navItems.map((item) => {
              const isActive = currentNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--border-color, #ffffff)',
                    backgroundColor: isActive ? 'var(--brutalist-cyan, #22d3ee)' : 'transparent',
                    color: isActive ? '#000000' : 'var(--color-white, #ffffff)',
                    fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '4px 4px 0px 0px var(--border-color, #ffffff)' : 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badgeCount && (
                    <Badge accent={isActive ? 'pink' : 'cyan'}>{item.badgeCount}</Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div style={{ paddingTop: '1rem', borderTop: '2px solid var(--border-color, #ffffff)' }}>
          <Button onClick={cycleTheme} bracketed style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            MODE: {theme.toUpperCase()}
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar fallback="RK" size="sm" accent="cyan" />
            <div>
              <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '0.85rem', fontWeight: 800 }}>
                Ryan Kelly
              </div>
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.7rem', color: 'var(--brutalist-cyan, #22d3ee)' }}>
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT SURFACE */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar Header */}
        <header
          style={{
            padding: '1rem 2rem',
            borderBottom: '3px solid var(--border-color, #ffffff)',
            backgroundColor: 'var(--color-black, #000000)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Badge accent="green">
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
              SYSTEM HEALTH: 100%
            </Badge>
            <Badge accent="cyan">YNAB API: CONNECTED</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button bracketed variant="pink" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <RefreshCw size={14} /> TRIGGER SYNC
            </Button>
          </div>
        </header>

        {/* Dynamic Admin Page View */}
        <div style={{ flex: 1, padding: '2rem' }}>
          {children || (
            <div>
              <h2 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', color: 'var(--brutalist-cyan, #22d3ee)' }}>
                [ SYSTEM OVERVIEW DASHBOARD ]
              </h2>

              {/* KPI Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card style={{ boxShadow: '4px 4px 0px 0px var(--brutalist-cyan, #22d3ee)' }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', opacity: 0.8 }}>NET CASHFLOW</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--brutalist-cyan, #22d3ee)', margin: '0.4rem 0' }}>+$4,280.00</div>
                  <Badge accent="green">+12.4% vs last month</Badge>
                </Card>

                <Card style={{ boxShadow: '4px 4px 0px 0px var(--brutalist-pink, #ec4899)' }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', opacity: 0.8 }}>UNRECONCILED AUDITS</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--brutalist-pink, #ec4899)', margin: '0.4rem 0' }}>3 VARIANCES</div>
                  <Badge accent="pink">ACTION REQUIRED</Badge>
                </Card>

                <Card style={{ boxShadow: '4px 4px 0px 0px var(--brutalist-yellow, #facc15)' }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', opacity: 0.8 }}>DRIVE BACKUP STATUS</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.4rem', fontWeight: 900, color: 'var(--brutalist-yellow, #facc15)', margin: '0.4rem 0' }}>SYNCED 10M AGO</div>
                  <Badge accent="yellow">~/Google Drive/Backup/</Badge>
                </Card>
              </div>

              {/* Data Table */}
              <Card>
                <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--brutalist-yellow, #facc15)' }}>
                  [ RECENT BANK STATEMENT INGESTIONS ]
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ffffff)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                      <th style={{ padding: '0.75rem' }}>STATEMENT SOURCE</th>
                      <th style={{ padding: '0.75rem' }}>COUNT</th>
                      <th style={{ padding: '0.75rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color, #ffffff)' }}>
                      <td style={{ padding: '0.75rem' }}>2026-07-26 21:40</td>
                      <td style={{ padding: '0.75rem' }}>Chase_Checking_July.csv</td>
                      <td style={{ padding: '0.75rem' }}>142 items</td>
                      <td style={{ padding: '0.75rem' }}><Badge accent="green">INGESTED</Badge></td>
                      <td style={{ padding: '0.75rem' }}><Button bracketed style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>VIEW</Button></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color, #ffffff)' }}>
                      <td style={{ padding: '0.75rem' }}>2026-07-25 14:15</td>
                      <td style={{ padding: '0.75rem' }}>Amex_Platinum_Statement.csv</td>
                      <td style={{ padding: '0.75rem' }}>88 items</td>
                      <td style={{ padding: '0.75rem' }}><Badge accent="cyan">AUDITED</Badge></td>
                      <td style={{ padding: '0.75rem' }}><Button bracketed style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>VIEW</Button></td>
                    </tr>
                  </tbody>
                </table>
              </Card>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};
