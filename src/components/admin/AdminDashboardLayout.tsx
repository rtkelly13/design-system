import React, { useState } from 'react';
import { LayoutDashboard, FileText, Sliders, LineChart, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { useTheme } from '../ThemeProvider';
import { LEVELS } from '../../theme/levels';

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

export interface AdminStatusBadge {
  id: string;
  label: string;
  accent?: 'green' | 'cyan' | 'pink' | 'yellow';
  icon?: React.ReactNode;
}

/**
 * Neutral placeholders. This is a layout shell in a shared package, so the
 * defaults have to read as "example content" rather than as any one product —
 * a consumer rendering `<AdminDashboardLayout />` inherits whatever is here.
 */
export const DEFAULT_ADMIN_STATUS: AdminStatusBadge[] = [
  { id: 'health', label: 'SYSTEM HEALTH: 100%', accent: 'green', icon: <ShieldCheck size={14} /> },
  { id: 'api', label: 'API: CONNECTED', accent: 'cyan' },
];

export interface AdminDashboardLayoutProps {
  /** Product name in the sidebar head. */
  appTitle?: string;
  /** Sidebar navigation. Defaults to `DEFAULT_ADMIN_NAV`, which is this demo's own list. */
  navItems?: AdminNavItem[];
  /** Header status pills. Pass `[]` to render none. */
  statusBadges?: AdminStatusBadge[];
  /**
   * Which nav item reads as current, by `id`. The layout does no route
   * matching — a host router decides what "current" means and passes it here.
   */
  activeNavId?: string;
  /**
   * Called with a nav item's `id` on click. Without it the sidebar is a
   * display: the layout holds no navigation state of its own.
   */
  onNavSelect?: (id: string) => void;
  /**
   * Main-region content, replacing the built-in demo body. Everything else on
   * the page — the stat row, the table, the status panel — is fixed, so this is
   * the only region a consumer controls.
   */
  children?: React.ReactNode;
}

/**
 * A complete admin shell: sidebar navigation, top bar with theme control, stat
 * row, data table and status panel.
 *
 * The same caveat as `SaasLandingPage` applies, and more sharply: this is one
 * dashboard rather than a layout you compose into. Nav items, stats and status
 * badges are props with defaults (`DEFAULT_ADMIN_NAV`, `DEFAULT_ADMIN_STATUS`),
 * but the arrangement is fixed and the content regions are not slots. Treat it
 * as the reference for what an admin surface should look like in this system,
 * and as the thing to decompose when a real one is needed —
 * `docs/surface-readiness.md` scores this surface at roughly 20% ready for
 * exactly that reason.
 *
 * It reads the theme through `useTheme`, so it must be rendered inside a
 * `ThemeProvider`; its stories each wrap it in one at a fixed level, which is
 * also why the level is its axis of variation.
 */
export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  appTitle = 'ADMIN CONSOLE',
  navItems = DEFAULT_ADMIN_NAV,
  statusBadges = DEFAULT_ADMIN_STATUS,
  activeNavId = 'dashboard',
  onNavSelect,
  children,
}) => {
  const [currentNav, setCurrentNav] = useState(activeNavId);
  const { level, cycleLevel } = useTheme();

  const handleSelect = (id: string) => {
    setCurrentNav(id);
    if (onNavSelect) onNavSelect(id);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--ds-surface-base)',
        color: 'var(--ds-text-primary)',
        fontFamily: 'var(--font-inter, "Inter"), sans-serif',
      }}
    >
      {/* 1. BRUTALIST SIDEBAR */}
      <aside
        style={{
          width: '280px',
          borderRight: '3px solid var(--ds-border-strong)',
          backgroundColor: 'var(--ds-surface-base)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem',
        }}
      >
        <div>
          {/* Logo Branding */}
          <div style={{ marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--ds-border-strong)' }}>
            <h1
              style={{
                fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                fontSize: '1.2rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                margin: 0,
                color: 'var(--ds-accent-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              [ {appTitle} ]
            </h1>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.75rem', color: 'var(--ds-accent-secondary)' }}>
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
                    border: '2px solid var(--ds-border-strong)',
                    backgroundColor: isActive ? 'var(--ds-accent-primary)' : 'transparent',
                    color: isActive ? 'var(--ds-text-inverse)' : 'var(--ds-text-primary)',
                    fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '4px 4px 0px 0px var(--ds-border-strong)' : 'none',
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
        <div style={{ paddingTop: '1rem', borderTop: '2px solid var(--ds-border-strong)' }}>
          <Button onClick={cycleLevel} bracketed style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            LEVEL: {LEVELS[level].label.toUpperCase()}
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar fallback="RK" size="sm" accent="cyan" />
            <div>
              <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '0.85rem', fontWeight: 800 }}>
                Ryan Kelly
              </div>
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.7rem', color: 'var(--ds-accent-primary)' }}>
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
            borderBottom: '3px solid var(--ds-border-strong)',
            backgroundColor: 'var(--ds-surface-base)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {statusBadges.map((badge) => (
              <Badge key={badge.id} accent={badge.accent ?? 'cyan'}>
                {badge.icon ? (
                  <span style={{ display: 'inline-flex', marginRight: '4px', verticalAlign: 'middle' }}>
                    {badge.icon}
                  </span>
                ) : null}
                {badge.label}
              </Badge>
            ))}
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
              <h2 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', color: 'var(--ds-accent-primary)' }}>
                [ SYSTEM OVERVIEW DASHBOARD ]
              </h2>

              {/* KPI Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card style={{ boxShadow: '4px 4px 0px 0px var(--ds-accent-primary)' }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', opacity: 0.8 }}>NET CASHFLOW</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--ds-accent-primary)', margin: '0.4rem 0' }}>+$4,280.00</div>
                  <Badge accent="green">+12.4% vs last month</Badge>
                </Card>

                <Card style={{ boxShadow: '4px 4px 0px 0px var(--ds-accent-tertiary)' }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', opacity: 0.8 }}>UNRECONCILED AUDITS</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--ds-accent-tertiary)', margin: '0.4rem 0' }}>3 VARIANCES</div>
                  <Badge accent="pink">ACTION REQUIRED</Badge>
                </Card>

                <Card style={{ boxShadow: '4px 4px 0px 0px var(--ds-accent-secondary)' }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', opacity: 0.8 }}>DRIVE BACKUP STATUS</div>
                  <div style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.4rem', fontWeight: 900, color: 'var(--ds-accent-secondary)', margin: '0.4rem 0' }}>SYNCED 10M AGO</div>
                  <Badge accent="yellow">~/Google Drive/Backup/</Badge>
                </Card>
              </div>

              {/* Data Table */}
              <Card>
                <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--ds-accent-secondary)' }}>
                  [ RECENT BANK STATEMENT INGESTIONS ]
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--ds-border-strong)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                      <th style={{ padding: '0.75rem' }}>STATEMENT SOURCE</th>
                      <th style={{ padding: '0.75rem' }}>COUNT</th>
                      <th style={{ padding: '0.75rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--ds-border-strong)' }}>
                      <td style={{ padding: '0.75rem' }}>2026-07-26 21:40</td>
                      <td style={{ padding: '0.75rem' }}>Chase_Checking_July.csv</td>
                      <td style={{ padding: '0.75rem' }}>142 items</td>
                      <td style={{ padding: '0.75rem' }}><Badge accent="green">INGESTED</Badge></td>
                      <td style={{ padding: '0.75rem' }}><Button bracketed style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>VIEW</Button></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--ds-border-strong)' }}>
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
