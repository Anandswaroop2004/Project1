import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { Package, Search, Layers, TrendingUp, IndianRupee } from 'lucide-react';

const InventoryLedgerPage = () => {
  const { user, isCommander } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBase, setSelectedBase] = useState(isCommander && user?.baseId ? user.baseId : null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getInventory({
        baseId: selectedBase || undefined,
        categoryId: selectedCategory || undefined,
      });
      if (res.success) {
        setInventory(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedBase, selectedCategory]);

  const filteredInventory = inventory.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.asset?.name?.toLowerCase().includes(term) ||
      item.asset?.assetCode?.toLowerCase().includes(term) ||
      item.base?.name?.toLowerCase().includes(term) ||
      item.asset?.category?.name?.toLowerCase().includes(term)
    );
  });

  const exportCols = [
    { header: 'Base', accessor: i => i.base?.name },
    { header: 'Category', accessor: i => i.asset?.category?.name },
    { header: 'Asset Code', accessor: i => i.asset?.assetCode },
    { header: 'Asset Name', accessor: i => i.asset?.name },
    { header: 'Opening Balance', accessor: i => i.openingBalance },
    { header: 'Purchased (+)', accessor: i => i.totalPurchased },
    { header: 'Transfers In (+)', accessor: i => i.totalTransferredIn },
    { header: 'Transfers Out (-)', accessor: i => i.totalTransferredOut },
    { header: 'Assigned', accessor: i => i.assignedQuantity },
    { header: 'Expended', accessor: i => i.expendedQuantity },
    { header: 'Closing Balance', accessor: i => i.closingBalance },
    { header: 'Current Available', accessor: i => i.currentBalance },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--bg-card)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={26} color="#ea580c" />
            <h1 className="font-military" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
              TACTICAL INVENTORY STOCK LEDGER
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
            Complete real-time ledger accounting for Opening Balances, Net Movements, Troop Allocations, and Closing Balances.
          </p>
        </div>

        <ExportButton title="Inventory Ledger Report" columns={exportCols} data={filteredInventory} filename="mams_inventory_ledger" />
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedBase={selectedBase}
        setSelectedBase={setSelectedBase}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateRange="ALL"
        setDateRange={() => {}}
        onRefresh={fetchInventory}
      />

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)' }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          type="text"
          className="input-tactical"
          style={{ background: 'transparent', border: 'none', padding: '0', fontSize: '0.9rem', color: 'var(--text-main)' }}
          placeholder="Search inventory by Asset name, Code, Base, or Category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Master Inventory Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: 'var(--bg-card)' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)', fontWeight: 500 }}>Loading inventory records...</div>
          ) : filteredInventory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)', fontWeight: 500 }}>No inventory found matching criteria.</div>
          ) : (
            <table className="table-tactical">
              <thead>
                <tr>
                  <th>MILITARY BASE</th>
                  <th>CATEGORY</th>
                  <th>ASSET / EQUIPMENT</th>
                  <th>OPENING BAL</th>
                  <th>PURCHASED (+)</th>
                  <th>TRANSFERS IN (+)</th>
                  <th>TRANSFERS OUT (-)</th>
                  <th>NET MOVEMENT</th>
                  <th>ASSIGNED</th>
                  <th>EXPENDED</th>
                  <th>CLOSING BAL</th>
                  <th>AVAILABLE STOCK</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const netMovement = (item.totalPurchased || 0) + (item.totalTransferredIn || 0) - (item.totalTransferredOut || 0);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#ea580c' }}>{item.base?.name}</td>
                      <td>
                        <span className="badge-tactical badge-info">{item.asset?.category?.name}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.asset?.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.asset?.assetCode}</div>
                      </td>
                      <td className="font-military" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.openingBalance}</td>
                      <td className="font-military" style={{ color: '#059669', fontWeight: 700 }}>+{item.totalPurchased}</td>
                      <td className="font-military" style={{ color: '#ea580c', fontWeight: 700 }}>+{item.totalTransferredIn}</td>
                      <td className="font-military" style={{ color: '#dc2626', fontWeight: 700 }}>-{item.totalTransferredOut}</td>
                      <td className="font-military" style={{ color: netMovement >= 0 ? '#d97706' : '#dc2626', fontWeight: 800 }}>
                        {netMovement >= 0 ? `+${netMovement}` : netMovement}
                      </td>
                      <td className="font-military" style={{ color: '#7c3aed', fontWeight: 700 }}>{item.assignedQuantity}</td>
                      <td className="font-military" style={{ color: '#dc2626', fontWeight: 700 }}>{item.expendedQuantity}</td>
                      <td className="font-military" style={{ color: '#059669', fontWeight: 800, fontSize: '1.05rem' }}>
                        {item.closingBalance}
                      </td>
                      <td>
                        <span className={`badge-tactical ${item.currentBalance > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.82rem' }}>
                          {item.currentBalance} {item.asset?.unitOfMeasure || 'Units'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryLedgerPage;
