import React from 'react';
import { ArrowRight, Check, Zap, Shield, Cpu } from 'lucide-react';
import { PageTitle } from '../PageTitle';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { AsciiDivider } from '../AsciiDivider';

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  accent: 'cyan' | 'pink' | 'yellow' | 'green';
  highlighted?: boolean;
  ctaText?: string;
}

export const DEFAULT_PRICING_TIERS: PricingTier[] = [
  {
    name: 'COMMUNITY',
    price: '$0',
    period: '/month',
    description: 'Single-player local SQLite storage and basic CSV bank reconciliation',
    features: ['Local SQLite Database', 'SHA-256 CSV Deduplication', 'Manual Bank Reconciliation', 'Community Support'],
    accent: 'cyan',
    ctaText: 'START FREE'
  },
  {
    name: 'PRO SaaS ENGINE',
    price: '$29',
    period: '/month',
    description: 'Automated YNAB sync, AI rule engine, and Google Drive atomic backups',
    features: ['Everything in Community', 'Real-Time YNAB API Sync', 'Automated Rule Engine', 'Google Drive Backups', 'Cashflow & Runway Forecaster'],
    accent: 'pink',
    highlighted: true,
    ctaText: 'DEPLOY PRO ENGINE'
  },
  {
    name: 'ENTERPRISE DECK',
    price: '$99',
    period: '/month',
    description: 'Multi-workspace deployment, open bank API integrations, and custom SLA',
    features: ['Unlimited Workspaces', 'Open Bank API Connectors', 'Custom Design System Themes', 'Dedicated Support & SLAs', 'Self-Hosted Options'],
    accent: 'yellow',
    ctaText: 'CONTACT SALES'
  }
];

const ACCENT_COLORS: Record<string, string> = {
  cyan: 'var(--brutalist-cyan, #22d3ee)',
  pink: 'var(--brutalist-pink, #ec4899)',
  yellow: 'var(--brutalist-yellow, #facc15)',
  green: 'var(--brutalist-neonGreen, #39ff14)',
};

export interface SaasLandingPageProps {
  title?: string;
  subtitle?: string;
  pricingTiers?: PricingTier[];
}

export const SaasLandingPage: React.FC<SaasLandingPageProps> = ({
  title = "HIGH-PERFORMANCE BRUTALIST SAAS PLATFORM",
  subtitle = "Subsume your financial mechanisms with real-time sync, automated audit rules, and zero-compromise design",
  pricingTiers = DEFAULT_PRICING_TIERS,
}) => {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        color: 'var(--color-white, #ffffff)',
        fontFamily: 'var(--font-inter, "Inter"), sans-serif',
      }}
    >
      {/* ═══════════ 1. HERO SECTION ═══════════ */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <Badge accent="cyan" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ⚡ NEXT-GEN SAAS INFRASTRUCTURE
        </Badge>

        <PageTitle subtitle={subtitle} bracketed>
          {title}
        </PageTitle>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <Button variant="pink" bracketed size="lg">
            LAUNCH APPLICATION <ArrowRight size={18} />
          </Button>
          <Button variant="default" bracketed size="lg">
            EXPLORE ARCHITECTURE
          </Button>
        </div>

        {/* Terminal Hero Preview */}
        <div
          style={{
            maxWidth: '800px',
            margin: '3.5rem auto 0 auto',
            border: '3px solid var(--border-color, #ffffff)',
            backgroundColor: 'var(--color-black, #000000)',
            boxShadow: '8px 8px 0px 0px var(--brutalist-cyan, #22d3ee)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.6rem 1rem',
              borderBottom: '2px solid var(--border-color, #ffffff)',
              backgroundColor: 'var(--color-white, #ffffff)',
              color: 'var(--color-black, #000000)',
              fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>// TERMINAL_ENGINE_DEMO.sh</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#39ff14', display: 'inline-block' }} />
              STATUS: ACTIVE
            </span>
          </div>
          <pre
            style={{
              padding: '1.5rem',
              fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
              fontSize: '0.9rem',
              color: 'var(--brutalist-neonGreen, #39ff14)',
              textAlign: 'left',
              overflowX: 'auto',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
{`$ saas-cli deploy --environment production
[✓] Connecting to local SQLite database... OK
[✓] Running SHA-256 deduplication on 1,420 transactions... OK
[✓] Triggering YNAB Live Sync Engine... SYNCHRONIZED
[✓] Atomic Google Drive Backup saved to ~/Google Drive/My Drive/Backup/
[*] Financial Surface Ready! Server active on http://localhost:8000`}
          </pre>
        </div>
      </section>

      <AsciiDivider style={{ margin: '3rem 0', color: 'var(--brutalist-cyan, #22d3ee)', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem' }} />

      {/* ═══════════ 2. FEATURE CARDS ═══════════ */}
      <section style={{ margin: '3rem 0' }}>
        <h2
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
            fontSize: '2rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: 'var(--color-white, #ffffff)',
            marginBottom: '3rem',
          }}
        >
          [ BUILT FOR EXTREME PERFORMANCE & CONTROL ]
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}
        >
          {[
            { title: 'REAL-TIME SYNC', accent: 'cyan' as const, icon: <Cpu size={28} style={{ color: ACCENT_COLORS.cyan }} />, desc: 'Automatic delta reconciliation between live banking APIs and local single-player SQLite databases.' },
            { title: 'RULE ENGINE', accent: 'pink' as const, icon: <Zap size={28} style={{ color: ACCENT_COLORS.pink }} />, desc: 'Custom automated regex & payee matching rules to categorize statement imports effortlessly.' },
            { title: 'DRIVE BACKUPS', accent: 'yellow' as const, icon: <Shield size={28} style={{ color: ACCENT_COLORS.yellow }} />, desc: 'Periodic, atomic SQLite file backups synced directly to Google Drive without external vendor lock-in.' },
          ].map((feature) => (
            <Card key={feature.title} panel accent={feature.accent} title={feature.title}>
              <div style={{ marginTop: '0.5rem' }}>
                {feature.icon}
                <p
                  style={{
                    marginTop: '0.75rem',
                    fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                    fontSize: '0.85rem',
                    color: 'var(--color-white, #ffffff)',
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <AsciiDivider style={{ margin: '3rem 0', color: 'var(--brutalist-cyan, #22d3ee)', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem' }} />

      {/* ═══════════ 3. PRICING TIERS ═══════════ */}
      <section style={{ margin: '3rem 0' }}>
        <h2
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
            fontSize: '2rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: 'var(--color-white, #ffffff)',
            marginBottom: '3rem',
          }}
        >
          [ TRANSPARENT PRICING ]
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            alignItems: 'stretch',
          }}
        >
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              panel
              accent={tier.accent}
              badge={tier.highlighted ? 'POPULAR' : undefined}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              {/* Tier Header */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--color-white, #ffffff)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {tier.name}
                </h3>

                {/* Price */}
                <div style={{ marginBottom: '1rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                      fontSize: '3rem',
                      fontWeight: 900,
                      color: ACCENT_COLORS[tier.accent],
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                        fontSize: '0.85rem',
                        color: 'var(--color-white, #ffffff)',
                        opacity: 0.6,
                      }}
                    >
                      {tier.period}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                    fontSize: '0.75rem',
                    color: 'var(--color-white, #ffffff)',
                    opacity: 0.8,
                    lineHeight: 1.5,
                    marginBottom: '1.5rem',
                  }}
                >
                  {tier.description}
                </p>

                {/* Feature list */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
                  {tier.features.map((feat) => (
                    <li
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                        fontSize: '0.8rem',
                        color: 'var(--color-white, #ffffff)',
                        opacity: 0.9,
                        marginBottom: '0.6rem',
                      }}
                    >
                      <Check size={14} style={{ color: 'var(--brutalist-neonGreen, #39ff14)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color, #ffffff)',
                  marginTop: 'auto',
                }}
              >
                <Button
                  variant={tier.accent === 'pink' ? 'pink' : tier.accent === 'yellow' ? 'yellow' : 'cyan'}
                  bracketed
                  style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
                >
                  {tier.ctaText || 'SELECT PLAN'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SaasLandingPage;
