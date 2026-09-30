import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Radio, LogOut, Clock, ChevronDown, Award, Sun, Moon } from 'lucide-react';
import militaryLogo from '../assets/military_logo.png';

const Navbar = () => {
  const { user, logout, isAdmin, isCommander } = useAuth();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25) + ' UTC');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mams-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mams-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getRoleBadgeClass = () => {
    if (isAdmin) return 'badge-admin';
    if (isCommander) return 'badge-commander';
    return 'badge-logistics';
  };

  const formatRoleName = (role) => {
    if (role === 'ADMIN') return 'SUPREME ADMIN';
    if (role === 'BASE_COMMANDER') return 'BASE COMMANDER';
    if (role === 'LOGISTICS_OFFICER') return 'LOGISTICS OFFICER';
    return role;
  };

  return (
    <header style={{
      height: '70px',
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      {/* Brand & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #ea580c',
            boxShadow: '0 0 15px rgba(234, 88, 12, 0.45), 0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090d16',
            flexShrink: 0
          }}>
            <img 
              src={militaryLogo} 
              alt="MAMS Tactical Military Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div>
            <div className="font-military" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              MAMS <span style={{ color: '#ea580c', fontSize: '0.8rem', fontWeight: 800 }}>// STRATEGIC LOGISTICS</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600 }}>
              MILITARY ASSET MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        {/* Live Network & Clock Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--pill-bg)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          marginLeft: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="radar-pulse" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', letterSpacing: '0.05em' }}>
              NET-SEC: ACTIVE
            </span>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }} className="font-mono">
            <Clock size={14} color="#ea580c" />
            {time}
          </div>
        </div>
      </div>

      {/* Action Buttons & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Switcher Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="btn-tactical btn-secondary"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            padding: '6px 12px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {theme === 'light' ? (
            <>
              <Sun size={15} color="#ea580c" />
              <span>LIGHT THEME</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#f97316" />
              <span>DARK THEME</span>
            </>
          )}
        </button>

        {/* Base Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--pill-bg)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <Radio size={14} color="#ea580c" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {user?.baseName || 'Joint Armed Forces HQ'}
          </span>
        </div>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--pill-bg)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Award size={18} color="#ea580c" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {user?.fullName || user?.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span className={`badge-tactical ${getRoleBadgeClass()}`} style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                  {formatRoleName(user?.role)}
                </span>
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-dim)" />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: '240px',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-card)',
              padding: '12px',
              zIndex: 200,
            }}>
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Service ID</div>
                <div className="font-mono" style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 700 }}>{user?.serviceNumber || 'DOD-HQ-001'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>Rank</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>{user?.militaryRank}</div>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="btn-tactical btn-danger"
                style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
