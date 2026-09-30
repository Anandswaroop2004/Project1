import React from 'react';
import { Crosshair, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import heroImg from '../assets/military_hero.png';

const HeroBanner = ({ onExploreNetMovement }) => {
  return (
    <div className="glass-panel" style={{
      position: 'relative',
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: '24px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)',
      minHeight: '190px',
      display: 'flex',
      alignItems: 'center',
      background: 'var(--bg-card)',
    }}>
      {/* Background Image with subtle blend positioned on the right */}
      <img
        src={heroImg}
        alt="Military Tactical Defense Command"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 35%',
          opacity: 0.18,
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Cyber overlay gradients adaptive to light/dark */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg-hero-grad)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '28px 32px',
        maxWidth: '850px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span className="badge-tactical badge-commander" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Crosshair size={13} /> COMBAT READINESS & LOGISTICS
          </span>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
            DEFENSE STATUS: DEFCON 3 ACTIVE
          </span>
        </div>

        <h1 className="font-military" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '0.04em' }}>
          STRATEGIC MILITARY ASSET DISPATCH & LEDGER
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '18px', maxWidth: '680px', fontWeight: 500 }}>
          Real-time tracking of Opening Balances, Net Movements (Purchases + Transfers In - Transfers Out), Troop Assignments, and Munitions Expenditures across all strategic armed forces bases.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={onExploreNetMovement} className="btn-tactical btn-primary">
            <Zap size={15} /> Analyze Net Movement Formula <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
