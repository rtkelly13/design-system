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
      }}
    >
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', margin: '2rem 0 5rem 0' }}>
        <Badge accent="cyan" style={{ marginBottom: '1.5rem' }}>
          ⚡ NEXT-GEN SAAS INFRASTRUCTURE
        </Badge>
        
        <PageTitle subtitle={subtitle} bracketed>
          {title}
        </PageTitle>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <Button variant="pink" bracketed style={{ padding: '0.8rem 1.75rem', fontSize: '1.1rem' }}>
            LAUNCH APPLICATION <ArrowRight size={18} />
          </Button>
          <Button variant="default" bracketed style={{ padding: '0.8rem 1.75rem', fontSize: '1.1rem' }}>
            EXPLORE ARCHITECTURE
          </Button>
        </div>

        {/* Live Terminal Hero Preview Box */}
        <div style={{ maxWidth: '800px', margin: '3.5rem auto 0 auto', border: '3px solid var(--border-color, #ffffff)', backgroundColor: 'var(--color-black, #000000)', boxShadow: '8px 8px 0px 0px var(--brutalist-cyan, #22d3ee)' }}>
          <div style={{ padding: '0.6rem 1rem', borderBottom: '2px solid var(--border-color, #ffffff)', backgroundColor: 'var(--border-color, #ffffff)', color: '#000000', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontWeight: 800, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>// TERMINAL_ENGINE_DEMO.sh</span>
            <span>STATUS: ACTIVE</span>
          </div>
          <pre style={{ padding: '1.5rem', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.9rem', color: 'var(--brutalist-neonGreen, #39ff14)', textAlign: 'left', overflowX: 'auto', margin: 0 }}>
{`$ saas-cli deploy --environment production
[✓] Connecting to local SQLite database... OK
[✓] Running SHA-256 deduplication on 1,420 transactions... OK
[✓] Triggering YNAB Live Sync Engine... SYNCHRONIZED
[✓] Atomic Google Drive Backup saved to ~/Google Drive/My Drive/Backup/
[★] Financial Surface Ready! Server active on http://localhost:8000`}
          </pre>
        </div>
      </section>

      <AsciiDivider />

      {/* 2. VALUE PROPOSITION & FEATURE GRID */}
      <section style={{ margin: '4rem 0' }}>
        <h2 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '2rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', marginBottom: '3rem' }}>
          [ BUILT FOR EXTREME PERFORMANCE & CONTROL ]
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <Card style={{ boxShadow: '6px 6px 0px 0px var(--brutalist-cyan, #22d3ee)' }}>
            <Cpu size={32} color="var(--brutalist-cyan, #22d3ee)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase' }}>
              REAL-TIME SYNC
            </h3>
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.875rem', opacity: 0.85 }}>
              Automatic delta reconciliation between live banking APIs and local single-player SQLite databases.
            </p>
          </Card>

          <Card style={{ boxShadow: '6px 6px 0px 0px var(--brutalist-pink, #ec4899)' }}>
            <Zap size={32} color="var(--brutalist-pink, #ec4899)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase' }}>
              RULE ENGINE
            </h3>
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.875rem', opacity: 0.85 }}>
              Custom automated regex & payee matching rules to categorize statement imports effortlessly.
            </p>
          </Card>

          <Card style={{ boxShadow: '6px 6px 0px 0px var(--brutalist-yellow, #facc15)' }}>
            <Shield size={32} color="var(--brutalist-yellow, #facc15)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase' }}>
              DRIVE BACKUPS
            </h3>
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.875rem', opacity: 0.85 }}>
              Periodic, atomic SQLite file backups synced directly to Google Drive without external vendor lock-in.
            </p>
          </Card>
        </div>
      </section>

      <AsciiDivider />

      {/* 3. SAAS PRICING TIERS */}
      <section style={{ margin: '4rem 0' }}>
        <h2 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '2rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', marginBottom: '3rem' }}>
          [ TRANSPARENT PRICING ]
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              style={{
                borderColor: tier.highlighted ? 'var(--brutalist-pink, #ec4899)' : 'var(--border-color, #ffffff)',
                boxShadow: tier.highlighted ? '8px 8px 0px 0px var(--brutalist-pink, #ec4899)' : '6px 6px 0px 0px var(--brutalist-cyan, #22d3ee)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                    {tier.name}
                  </h3>
                  {tier.highlighted && <Badge accent="pink">POPULAR</Badge>}
                </div>

                <div style={{ margin: '1.5rem 0' }}>
                  <span style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '3rem', fontWeight: 900 }}>
                    {tier.price}
                  </span>
                  {tier.period && <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.9rem', opacity: 0.7 }}>{tier.period}</span>}
                </div>

                <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem', opacity: 0.85, marginBottom: '1.5rem' }}>
                  {tier.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem' }}>
                  {tier.features.map((feat) => (
                    <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <Check size={16} color="var(--brutalist-neonGreen, #39ff14)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button bracketed variant={tier.highlighted ? 'pink' : 'default'} style={{ width: '100%', marginTop: '1.5rem' }}>
                {tier.ctaText || 'SELECT PLAN'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
};
