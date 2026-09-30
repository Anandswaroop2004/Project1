import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Key, Award, Radio, AlertCircle, CheckCircle2, ArrowRight, Crosshair, Zap, Activity } from 'lucide-react';
import heroImg from '../assets/military_hero.png';
import militaryLogo from '../assets/military_logo.png';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [militaryRank, setMilitaryRank] = useState('Captain');
  const [serviceNumber, setServiceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('LOGISTICS_OFFICER');
  const [baseId, setBaseId] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await register({
        username,
        password,
        fullName,
        militaryRank,
        serviceNumber: serviceNumber || `MIL-${Math.floor(1000 + Math.random() * 9000)}`,
        email,
        role,
        baseId: Number(baseId),
      });
      setSuccessMsg('Registration successful! You may now sign in with your military credentials.');
      setIsRegisterMode(false);
      setPassword('password123');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (userType) => {
    setError(null);
    setSuccessMsg(null);
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else if (userType === 'commander_liberty') {
      setUsername('commander_liberty');
      setPassword('password123');
    } else if (userType === 'commander_pendleton') {
      setUsername('commander_pendleton');
      setPassword('password123');
    } else if (userType === 'logistics_liberty') {
      setUsername('logistics_liberty');
      setPassword('password123');
    } else if (userType === 'logistics_pendleton') {
      setUsername('logistics_pendleton');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '24px',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Background Military Hero Image - 100% Crisp, Vivid, and Clearly Visible */}
      <img
        src={heroImg}
        alt="Military Tactical Combat Operations"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 30%',
          opacity: 1,
          filter: 'brightness(0.98) contrast(1.06) saturate(1.12)',
          zIndex: 1,
        }}
      />

      {/* Subtle Focus Vignette so background image is 100% clearly visible */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(15, 23, 42, 0.25) 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Subtle Tactical Grid Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 3,
        pointerEvents: 'none'
      }} />

      {/* Main Authentication Container in Crisp Light Theme */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '540px',
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15), 0 0 30px rgba(249, 115, 22, 0.12)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        {/* Header Branding with Custom Military Logo Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            margin: '0 auto 14px auto',
            border: '2.5px solid #ea580c',
            boxShadow: '0 6px 25px rgba(234, 88, 12, 0.45), 0 2px 10px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={militaryLogo} 
              alt="MAMS Military Command Emblem" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className="badge-tactical badge-commander" style={{ fontSize: '0.72rem' }}>
              <Crosshair size={12} /> SECURE COMMAND PORTAL
            </span>
            <span className="badge-tactical badge-success" style={{ fontSize: '0.72rem' }}>
              DEFCON 3 ACTIVE
            </span>
          </div>

          <h2 className="font-military" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.06em' }}>
            MILITARY ASSET MANAGEMENT
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
            STRATEGIC DEFENSE LOGISTICS & INVENTORY LEDGER
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'rgba(220, 38, 38, 0.12)',
            border: '1px solid rgba(220, 38, 38, 0.35)',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '18px',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'rgba(5, 150, 105, 0.12)',
            border: '1px solid rgba(5, 150, 105, 0.35)',
            borderRadius: '8px',
            color: '#059669',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '18px',
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Selector: Sign In vs Register */}
        <div style={{
          display: 'flex',
          background: 'var(--pill-bg)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: !isRegisterMode ? 'var(--bg-card)' : 'transparent',
              color: !isRegisterMode ? '#ea580c' : 'var(--text-muted)',
              fontFamily: 'var(--font-military)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: !isRegisterMode ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Tactical Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: isRegisterMode ? 'var(--bg-card)' : 'transparent',
              color: isRegisterMode ? '#ea580c' : 'var(--text-muted)',
              fontFamily: 'var(--font-military)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isRegisterMode ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Register Personnel
          </button>
        </div>

        {/* Quick Demo Switcher (Instant Test Accounts) */}
        {!isRegisterMode && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }} className="font-military">
              <Zap size={13} color="#ea580c" /> SELECT TEST CREDENTIALS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                style={{
                  padding: '8px 10px',
                  background: username === 'admin' ? 'rgba(124, 58, 237, 0.12)' : 'var(--bg-card)',
                  border: `1px solid ${username === 'admin' ? '#7c3aed' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: username === 'admin' ? '#7c3aed' : 'var(--text-main)',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 800, color: '#7c3aed' }}>👑 SUPREME ADMIN</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>admin (Full Clearance)</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('commander_liberty')}
                style={{
                  padding: '8px 10px',
                  background: username === 'commander_liberty' ? 'rgba(234, 88, 12, 0.12)' : 'var(--bg-card)',
                  border: `1px solid ${username === 'commander_liberty' ? '#ea580c' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: username === 'commander_liberty' ? '#ea580c' : 'var(--text-main)',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 800, color: '#ea580c' }}>⭐ BASE COMMANDER</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fort Liberty Command</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('commander_pendleton')}
                style={{
                  padding: '8px 10px',
                  background: username === 'commander_pendleton' ? 'rgba(234, 88, 12, 0.12)' : 'var(--bg-card)',
                  border: `1px solid ${username === 'commander_pendleton' ? '#ea580c' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: username === 'commander_pendleton' ? '#ea580c' : 'var(--text-main)',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 800, color: '#ea580c' }}>⭐ BASE COMMANDER</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Camp Pendleton Base</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('logistics_liberty')}
                style={{
                  padding: '8px 10px',
                  background: username === 'logistics_liberty' ? 'rgba(217, 119, 6, 0.12)' : 'var(--bg-card)',
                  border: `1px solid ${username === 'logistics_liberty' ? '#d97706' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: username === 'logistics_liberty' ? '#d97706' : 'var(--text-main)',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 800, color: '#d97706' }}>📦 LOGISTICS OFFICER</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Purchases & Transfers</div>
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        {!isRegisterMode ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }} className="font-military">
                MILITARY IDENTIFIER / USERNAME
              </label>
              <input
                type="text"
                className="input-tactical"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin, commander_liberty"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }} className="font-military">
                SECURITY PASSPHRASE
              </label>
              <input
                type="password"
                className="input-tactical"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passphrase"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactical btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.92rem' }}
            >
              {loading ? 'AUTHENTICATING MILITARY CLEARANCE...' : 'ACCESS COMMAND HUB'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Username</label>
              <input
                type="text"
                className="input-tactical"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Password</label>
              <input
                type="password"
                className="input-tactical"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                className="input-tactical"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maj. General John Miller"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Military Rank</label>
                <input
                  type="text"
                  className="input-tactical"
                  value={militaryRank}
                  onChange={(e) => setMilitaryRank(e.target.value)}
                  placeholder="e.g. Colonel, Major"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Service ID</label>
                <input
                  type="text"
                  className="input-tactical font-mono"
                  value={serviceNumber}
                  onChange={(e) => setServiceNumber(e.target.value)}
                  placeholder="e.g. USA-LOG-902"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Official Military Email</label>
              <input
                type="email"
                className="input-tactical"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@mams.mil"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Assigned Role (RBAC)</label>
                <select
                  className="select-tactical"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="LOGISTICS_OFFICER">Logistics Officer</option>
                  <option value="BASE_COMMANDER">Base Commander</option>
                  <option value="ADMIN">Supreme Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Assigned Military Base</label>
                <select
                  className="select-tactical"
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value)}
                >
                  <option value="1">Fort Liberty</option>
                  <option value="2">Camp Pendleton</option>
                  <option value="3">Nellis Air Base</option>
                  <option value="4">Ramstein Base</option>
                  <option value="5">Norfolk Station</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactical btn-emerald"
              style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '0.9rem' }}
            >
              {loading ? 'REGISTERING...' : 'REGISTER MILITARY PERSONNEL'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
