import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowLeftRight, 
  Users, 
  Package, 
  ShieldAlert, 
  Activity, 
  FileText,
  Sliders
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, isCommander, isLogistics } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Operational Dashboard',
      icon: LayoutDashboard,
      badge: 'LIVE',
      show: true,
    },
    {
      to: '/purchases',
      label: 'Procurements & Purchases',
      icon: ShoppingCart,
      badge: null,
      show: true,
    },
    {
      to: '/transfers',
      label: 'Inter-Base Transfers',
      icon: ArrowLeftRight,
      badge: null,
      show: true,
    },
    {
      to: '/assignments-expenditures',
      label: 'Assignments & Expenditures',
      icon: Users,
      badge: null,
      show: true,
    },
    {
      to: '/inventory',
      label: 'Inventory Stock Ledger',
      icon: Package,
      badge: null,
      show: true,
    },
    {
      to: '/audit-logs',
      label: 'Audit Trail & Security Logs',
      icon: ShieldAlert,
      badge: 'SEC',
      show: isAdmin || isCommander,
    },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 70px)',
      padding: '20px 14px',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{ marginBottom: '16px', paddingLeft: '10px' }}>
        <div className="font-military" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700 }}>
          NAVIGATION MODULES
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '8px',
                color: isActive ? '#ea580c' : 'var(--text-muted)',
                background: isActive ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: item.badge === 'LIVE' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                  color: item.badge === 'LIVE' ? '#059669' : '#7c3aed',
                  border: `1px solid ${item.badge === 'LIVE' ? 'rgba(5, 150, 105, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Clearance Box */}
      <div style={{
        marginTop: 'auto',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Activity size={15} color="#ea580c" />
          <span className="font-military" style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 700 }}>
            TACTICAL PROTOCOL
          </span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45, fontWeight: 500 }}>
          All movements, expenditures and transfers are encrypted and logged in DoD compliant tamper-proof audit stores.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
