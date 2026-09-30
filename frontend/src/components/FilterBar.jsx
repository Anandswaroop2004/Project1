import React, { useState, useEffect } from 'react';
import { basesApi, assetsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Filter, Calendar, MapPin, Layers, RefreshCw } from 'lucide-react';

const FilterBar = ({
  selectedBase,
  setSelectedBase,
  selectedCategory,
  setSelectedCategory,
  dateRange,
  setDateRange,
  onRefresh,
}) => {
  const { user, isCommander, isLogistics } = useAuth();
  const [bases, setBases] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [basesRes, catsRes] = await Promise.all([
          basesApi.getAllBases(),
          assetsApi.getCategories(),
        ]);
        if (basesRes.success) setBases(basesRes.data || []);
        if (catsRes.success) setCategories(catsRes.data || []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '24px',
      background: 'var(--bg-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={18} color="#ea580c" />
        <span className="font-military" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
          STRATEGIC FILTERS:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', flex: 1 }}>
        {/* Military Base Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
          <MapPin size={16} color="var(--text-dim)" />
          <select
            className="select-tactical"
            value={selectedBase || ''}
            onChange={(e) => setSelectedBase(e.target.value ? Number(e.target.value) : null)}
            disabled={isCommander && user?.baseId} // Base commander locked to their base
          >
            <option value="">All Military Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
          <Layers size={16} color="var(--text-dim)" />
          <select
            className="select-tactical"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Equipment Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Window Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
          <Calendar size={16} color="var(--text-dim)" />
          <select
            className="select-tactical"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="ALL">All Recorded Time</option>
            <option value="30D">Last 30 Days</option>
            <option value="7D">Last 7 Days</option>
            <option value="TODAY">Today (Last 24h)</option>
          </select>
        </div>
      </div>

      {/* Reset & Refresh Button */}
      <div>
        <button
          onClick={onRefresh}
          className="btn-tactical btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          title="Reload Latest Real-Time Data"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
