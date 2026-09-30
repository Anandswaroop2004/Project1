import React from 'react';
import { ChevronRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'cyan', // 'cyan', 'emerald', 'amber', 'rose', 'purple'
  interactive = false,
  badgeText = null,
  onClick = null,
}) => {
  const getAccentDetails = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          glow: 'var(--shadow-glow-emerald)',
          color: '#059669',
          bgIcon: 'rgba(5, 150, 105, 0.12)',
          border: 'rgba(5, 150, 105, 0.3)',
        };
      case 'amber':
        return {
          glow: 'var(--shadow-glow-amber)',
          color: '#d97706',
          bgIcon: 'rgba(217, 119, 6, 0.12)',
          border: 'rgba(217, 119, 6, 0.3)',
        };
      case 'rose':
        return {
          glow: '0 0 25px rgba(220, 38, 38, 0.2)',
          color: '#dc2626',
          bgIcon: 'rgba(220, 38, 38, 0.12)',
          border: 'rgba(220, 38, 38, 0.3)',
        };
      case 'purple':
        return {
          glow: '0 0 25px rgba(124, 58, 237, 0.2)',
          color: '#7c3aed',
          bgIcon: 'rgba(124, 58, 237, 0.12)',
          border: 'rgba(124, 58, 237, 0.3)',
        };
      default:
        return {
          glow: 'var(--shadow-glow-amber)',
          color: '#ea580c',
          bgIcon: 'rgba(249, 115, 22, 0.12)',
          border: 'rgba(249, 115, 22, 0.35)',
        };
    }
  };

  const accent = getAccentDetails();

  return (
    <div
      onClick={onClick}
      className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''}`}
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${accent.color}`,
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {/* Background glow circle */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: accent.bgIcon,
        filter: 'blur(20px)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span className="font-military" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            {title}
          </span>
          {badgeText && (
            <span style={{
              marginLeft: '8px',
              fontSize: '0.68rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: accent.bgIcon,
              color: accent.color,
              border: `1px solid ${accent.border}`,
              fontWeight: 700
            }}>
              {badgeText}
            </span>
          )}
        </div>

        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: accent.bgIcon,
            border: `1px solid ${accent.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={20} color={accent.color} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span className="font-military" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {subtitle}
        </span>
        {interactive && (
          <span style={{
            fontSize: '0.78rem',
            color: accent.color,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontWeight: 700
          }}>
            VIEW BREAKDOWN <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
