import React, { useState, useEffect } from 'react';
import { purchasesApi, basesApi, assetsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { ShoppingCart, Plus, Search, DollarSign, X } from 'lucide-react';
import procurementBannerImg from '../assets/image2.png';

const PurchasesPage = () => {
  const { user, isCommander } = useAuth();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBase, setSelectedBase] = useState(isCommander && user?.baseId ? user.baseId : null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bases, setBases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);

  // Form State
  const [formBaseId, setFormBaseId] = useState(user?.baseId || 1);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAssetId, setFormAssetId] = useState('');
  const [formQuantity, setFormQuantity] = useState(10);
  const [formUnitCost, setFormUnitCost] = useState('');
  const [formSupplier, setFormSupplier] = useState('General Dynamics Land Systems');
  const [formPoNumber, setFormPoNumber] = useState('');
  const [formNotes, setFormNotes] = useState('');
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

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateParams();
      const res = await purchasesApi.getPurchases({
        baseId: selectedBase || undefined,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.success) {
        setPurchases(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [selectedBase, selectedCategory, dateRange]);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [basesRes, catRes, assetsRes] = await Promise.all([
          basesApi.getAllBases(),
          assetsApi.getCategories(),
          assetsApi.getAllAssets(),
        ]);
        if (basesRes.success) setBases(basesRes.data || []);
        if (catRes.success) {
          setCategories(catRes.data || []);
          if (catRes.data && catRes.data.length > 0 && !formCategoryId) {
            setFormCategoryId(catRes.data[0].id);
          }
        }
        if (assetsRes.success) {
          setAssets(assetsRes.data || []);
          if (assetsRes.data && assetsRes.data.length > 0 && !formAssetId) {
            setFormAssetId(assetsRes.data[0].id);
            setFormUnitCost(assetsRes.data[0].unitPrice);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadFormData();
  }, []);

  const handleAssetSelectChange = (assetId) => {
    setFormAssetId(assetId);
    const sel = assets.find(a => String(a.id) === String(assetId));
    if (sel) {
      setFormUnitCost(sel.unitPrice);
      if (sel.category?.id) {
        setFormCategoryId(sel.category.id);
      }
    }
  };

  const handleRecordPurchase = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload = {
        purchaseOrderNumber: formPoNumber || `PO-${new Date().getFullYear()}-MIL-${Math.floor(1000 + Math.random() * 9000)}`,
        baseId: Number(formBaseId),
        assetId: Number(formAssetId),
        quantity: Number(formQuantity),
        unitCost: Number(formUnitCost),
        supplier: formSupplier,
        purchaseDate: new Date().toISOString(),
        notes: formNotes,
      };

      const res = await purchasesApi.recordPurchase(payload);
      if (res.success) {
        setFormSuccess('Purchase recorded successfully! Base inventory ledger updated.');
        fetchPurchases();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess(null);
          setFormNotes('');
          setFormPoNumber('');
        }, 1200);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to record purchase.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.purchaseOrderNumber?.toLowerCase().includes(term) ||
      p.asset?.name?.toLowerCase().includes(term) ||
      p.supplier?.toLowerCase().includes(term) ||
      p.base?.name?.toLowerCase().includes(term)
    );
  });

  const exportColumns = [
    { header: 'PO Number', accessor: p => p.purchaseOrderNumber },
    { header: 'Base', accessor: p => p.base?.name },
    { header: 'Category', accessor: p => p.asset?.category?.name },
    { header: 'Asset Name', accessor: p => p.asset?.name },
    { header: 'Quantity', accessor: p => p.quantity },
    { header: 'Unit Cost (₹)', accessor: p => p.unitCost },
    { header: 'Total Cost (₹)', accessor: p => p.totalCost },
    { header: 'Supplier', accessor: p => p.supplier },
    { header: 'Purchase Date', accessor: p => p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : '' },
    { header: 'Status', accessor: p => p.status },
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
          src={procurementBannerImg}
          alt="Weapons Procurement"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '55%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 35%',
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
            <span className="badge-tactical badge-commander" style={{ fontSize: '0.7rem' }}>ACQUISITION PORTAL</span>
          </div>
          <h1 className="font-military" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '0.04em' }}>
            PROCUREMENT & ASSET PURCHASES
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, maxWidth: '700px' }}>
            Record new defense assets, weapons, and munitions acquisitions for military bases with audit tracking.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px', gap: '12px' }}>
        <ExportButton title="Purchases Report" columns={exportColumns} data={filteredPurchases} filename="mams_purchases_report" />
        <button
          onClick={() => {
            setFormPoNumber(`PO-${new Date().getFullYear()}-MIL-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsModalOpen(true);
          }}
          className="btn-tactical btn-primary"
        >
          <Plus size={16} /> Record New Purchase
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
        onRefresh={fetchPurchases}
      />

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          type="text"
          className="input-tactical"
          style={{ background: 'transparent', border: 'none', padding: '0', fontSize: '0.9rem' }}
          placeholder="Search purchases by PO Number, Equipment name, Base, or Supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Purchases Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
              Loading military procurement records...
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
              No purchase orders found matching the selected filters.
            </div>
          ) : (
            <table className="table-tactical">
              <thead>
                <tr>
                  <th>PO NUMBER</th>
                  <th>DESTINATION BASE</th>
                  <th>CATEGORY</th>
                  <th>ASSET / EQUIPMENT</th>
                  <th>QTY</th>
                  <th>UNIT COST</th>
                  <th>TOTAL COST</th>
                  <th>SUPPLIER</th>
                  <th>PURCHASE DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono" style={{ color: '#ea580c', fontWeight: 600 }}>{p.purchaseOrderNumber}</td>
                    <td>{p.base?.name}</td>
                    <td>
                      <span className="badge-tactical badge-info">{p.asset?.category?.name}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.asset?.name}</td>
                    <td className="font-military" style={{ color: '#059669', fontWeight: 700 }}>+{p.quantity}</td>
                    <td>₹{Number(p.unitCost).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#ea580c', fontWeight: 700 }}>₹{Number(p.totalCost).toLocaleString('en-IN')}</td>
                    <td>{p.supplier}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className="badge-tactical badge-success">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Purchase Modal */}
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
                <ShoppingCart size={20} color="#ea580c" />
                <h3 className="font-military" style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  RECORD ASSET PROCUREMENT
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPurchase} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PO Number</label>
                  <input
                    type="text"
                    className="input-tactical font-mono"
                    value={formPoNumber}
                    onChange={(e) => setFormPoNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Destination Military Base</label>
                  <select
                    className="select-tactical"
                    value={formBaseId}
                    onChange={(e) => setFormBaseId(e.target.value)}
                    required
                  >
                    {bases.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Select Asset / Equipment to Purchase</label>
                <select
                  className="select-tactical"
                  value={formAssetId}
                  onChange={(e) => handleAssetSelectChange(e.target.value)}
                  required
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.category?.name}] {a.name} - (Standard: ₹{Number(a.unitPrice).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quantity Received</label>
                  <input
                    type="number"
                    min="1"
                    className="input-tactical"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-tactical"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{
                background: 'var(--pill-bg)',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Calculated Total Purchase Amount:</span>
                <span className="font-military" style={{ fontSize: '1.25rem', color: '#ea580c', fontWeight: 800 }}>
                  ₹{(Number(formQuantity || 0) * Number(formUnitCost || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Defense Supplier / Contractor</label>
                <input
                  type="text"
                  className="input-tactical"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="e.g. Lockheed Martin, Colt Defense"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Procurement Notes / Batch Details</label>
                <textarea
                  className="textarea-tactical"
                  rows="2"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional delivery inspection remarks, contract numbers, etc."
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
                  disabled={formLoading}
                  className="btn-tactical btn-primary"
                >
                  {formLoading ? 'Recording in Ledger...' : 'Confirm & Record Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
