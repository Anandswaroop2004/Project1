import React, { useState, useEffect } from 'react';
import { transfersApi, basesApi, assetsApi, inventoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { ArrowLeftRight, Plus, Search, CheckCircle2, AlertCircle, X, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import transferBannerImg from '../assets/image3.png';

const TransfersPage = () => {
  const { user, isCommander } = useAuth();

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBase, setSelectedBase] = useState(isCommander && user?.baseId ? user.baseId : null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Base Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [sourceInventory, setSourceInventory] = useState([]);

  // Form State
  const [formSourceBaseId, setFormSourceBaseId] = useState(user?.baseId || 1);
  const [formDestBaseId, setFormDestBaseId] = useState(2);
  const [formAssetId, setFormAssetId] = useState('');
  const [formQuantity, setFormQuantity] = useState(5);
  const [formTransferNumber, setFormTransferNumber] = useState('');
  const [formReason, setFormReason] = useState('Operational reallocation for tactical training deployment.');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const getDateParams = () => {
    let startDate = null;
    let endDate = null;
    const now = new Date();
    if (dateRange === 'TODAY') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      endDate = now.toISOString();
    } else if (dateRange === '7D') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      endDate = now.toISOString();
    } else if (dateRange === '30D') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      endDate = now.toISOString();
    }
    return { startDate, endDate };
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateParams();
      const res = await transfersApi.getTransfers({
        baseId: selectedBase || undefined,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.success) {
        setTransfers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [selectedBase, selectedCategory, dateRange]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [basesRes, assetsRes] = await Promise.all([
          basesApi.getAllBases(),
          assetsApi.getAllAssets(),
        ]);
        if (basesRes.success) {
          setBases(basesRes.data || []);
          if (basesRes.data.length > 1) {
            setFormDestBaseId(basesRes.data[1].id);
          }
        }
        if (assetsRes.success) {
          setAssets(assetsRes.data || []);
          if (assetsRes.data.length > 0) {
            setFormAssetId(assetsRes.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch available stock when source base changes
  useEffect(() => {
    const fetchSourceStock = async () => {
      if (!formSourceBaseId) return;
      try {
        const res = await inventoryApi.getInventoryByBase(formSourceBaseId);
        if (res.success) {
          setSourceInventory(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSourceStock();
  }, [formSourceBaseId]);

  const getAvailableStockForAsset = (assetId) => {
    const inv = sourceInventory.find(i => String(i.asset?.id) === String(assetId));
    return inv ? inv.currentBalance : 0;
  };

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    if (String(formSourceBaseId) === String(formDestBaseId)) {
      setFormError('Source base and destination base cannot be the same military base.');
      return;
    }

    const available = getAvailableStockForAsset(formAssetId);
    if (Number(formQuantity) > available) {
      setFormError(`Insufficient stock at source base. Current available: ${available}, Requested: ${formQuantity}`);
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload = {
        transferNumber: formTransferNumber || `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        sourceBaseId: Number(formSourceBaseId),
        destinationBaseId: Number(formDestBaseId),
        assetId: Number(formAssetId),
        quantity: Number(formQuantity),
        dispatchedAt: new Date().toISOString(),
        reasonOrMission: formReason,
      };

      const res = await transfersApi.initiateTransfer(payload);
      if (res.success) {
        setFormSuccess('Transfer dispatched and ledger updated across both bases!');
        fetchTransfers();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess(null);
          setFormTransferNumber('');
        }, 1200);
      }
    } catch (err) {
      setFormError(err.message || 'Transfer failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.transferNumber?.toLowerCase().includes(term) ||
      t.asset?.name?.toLowerCase().includes(term) ||
      t.sourceBase?.name?.toLowerCase().includes(term) ||
      t.destinationBase?.name?.toLowerCase().includes(term) ||
      t.reasonOrMission?.toLowerCase().includes(term)
    );
  });

  const exportColumns = [
    { header: 'Transfer Number', accessor: t => t.transferNumber },
    { header: 'Source Base', accessor: t => t.sourceBase?.name },
    { header: 'Destination Base', accessor: t => t.destinationBase?.name },
    { header: 'Asset Name', accessor: t => t.asset?.name },
    { header: 'Quantity', accessor: t => t.quantity },
    { header: 'Dispatched Date', accessor: t => t.dispatchedAt ? new Date(t.dispatchedAt).toLocaleString() : '' },
    { header: 'Status', accessor: t => t.status },
    { header: 'Reason / Mission', accessor: t => t.reasonOrMission },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Tactical Banner with Military Image */}
      <div className="glass-panel" style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
        minHeight: '130px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-card)',
      }}>
        <img
          src={transferBannerImg}
          alt="Inter-Base Transfers"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '55%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            opacity: 0.18,
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-hero-grad)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge-tactical badge-commander" style={{ fontSize: '0.7rem' }}>STRATEGIC REDISTRIBUTION</span>
          </div>
          <h1 className="font-military" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '0.04em' }}>
            INTER-BASE ASSET TRANSFERS
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, maxWidth: '700px' }}>
            Facilitate strategic redistribution of weapons, combat vehicles, and munitions between military bases.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px', gap: '12px' }}>
        <ExportButton title="Transfers Manifest Report" columns={exportColumns} data={filteredTransfers} filename="mams_transfers_report" />
        <button
          onClick={() => {
            setFormTransferNumber(`TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsModalOpen(true);
          }}
          className="btn-tactical btn-primary"
        >
          <Plus size={16} /> Initiate Base Transfer
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedBase={selectedBase}
        setSelectedBase={setSelectedBase}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={fetchTransfers}
      />

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          type="text"
          className="input-tactical"
          style={{ background: 'transparent', border: 'none', padding: '0', fontSize: '0.9rem' }}
          placeholder="Search transfers by Transfer #, Asset name, Origin Base, Destination Base, or Reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transfers History Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
              Loading transfer manifests...
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
              No transfer records found matching the filters.
            </div>
          ) : (
            <table className="table-tactical">
              <thead>
                <tr>
                  <th>TRANSFER #</th>
                  <th>ORIGIN (SOURCE BASE)</th>
                  <th>DESTINATION BASE</th>
                  <th>EQUIPMENT</th>
                  <th>QTY</th>
                  <th>DISPATCH TIMESTAMP</th>
                  <th>COMPLETED TIMESTAMP</th>
                  <th>STATUS</th>
                  <th>MISSION / REASON</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono" style={{ color: '#ea580c', fontWeight: 600 }}>{t.transferNumber}</td>
                    <td>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>{t.sourceBase?.name}</span>
                    </td>
                    <td>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{t.destinationBase?.name}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.asset?.name}</td>
                    <td className="font-military" style={{ color: '#ea580c', fontWeight: 700 }}>{t.quantity}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t.dispatchedAt ? new Date(t.dispatchedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t.completedAt ? new Date(t.completedAt).toLocaleString() : 'Pending'}
                    </td>
                    <td>
                      <span className="badge-tactical badge-success">{t.status}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                      {t.reasonOrMission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Initiate Transfer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--modal-header-bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ArrowLeftRight size={20} color="#ea580c" />
                <h3 className="font-military" style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  INITIATE BASE-TO-BASE ASSET TRANSFER
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInitiateTransfer} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '10px', background: 'rgba(220, 38, 38, 0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', color: '#dc2626', fontSize: '0.82rem' }}>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ padding: '10px', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '6px', color: '#059669', fontSize: '0.82rem' }}>
                  {formSuccess}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Transfer Tracking ID</label>
                <input
                  type="text"
                  className="input-tactical font-mono"
                  value={formTransferNumber}
                  onChange={(e) => setFormTransferNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Origin (Source Base - Outflow)</label>
                  <select
                    className="select-tactical"
                    value={formSourceBaseId}
                    onChange={(e) => setFormSourceBaseId(e.target.value)}
                    required
                  >
                    {bases.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Destination (Target Base - Inflow)</label>
                  <select
                    className="select-tactical"
                    value={formDestBaseId}
                    onChange={(e) => setFormDestBaseId(e.target.value)}
                    required
                  >
                    {bases.filter(b => String(b.id) !== String(formSourceBaseId)).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Asset to Transfer</label>
                <select
                  className="select-tactical"
                  value={formAssetId}
                  onChange={(e) => setFormAssetId(e.target.value)}
                  required
                >
                  {assets.map(a => {
                    const stock = getAvailableStockForAsset(a.id);
                    return (
                      <option key={a.id} value={a.id}>
                        {a.name} (Available at Source: {stock})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Available Balance at Origin:</span>
                <span className="font-military" style={{ fontSize: '1.2rem', color: getAvailableStockForAsset(formAssetId) > 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                  {getAvailableStockForAsset(formAssetId)} Units
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={getAvailableStockForAsset(formAssetId) || 1000}
                  className="input-tactical"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mission Reason / Strategic Order</label>
                <textarea
                  className="textarea-tactical"
                  rows="2"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Specify exercise, deployment rotation or allied reinforcement need..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-tactical btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || getAvailableStockForAsset(formAssetId) <= 0}
                  className="btn-tactical btn-primary"
                >
                  {formLoading ? 'Dispatching...' : 'Dispatch Transfer Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
