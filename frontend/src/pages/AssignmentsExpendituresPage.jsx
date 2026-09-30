import React, { useState, useEffect } from 'react';
import { assignmentsApi, expendituresApi, basesApi, assetsApi, inventoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import ExportButton from '../components/ExportButton';
import { 
  Users, 
  Flame, 
  Plus, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  UserCheck, 
  Crosshair, 
  Award, 
  Calendar 
} from 'lucide-react';
import soldierBannerImg from '../assets/image1.png';

const AssignmentsExpendituresPage = () => {
  const { user, isCommander } = useAuth();

  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'expenditures'
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBase, setSelectedBase] = useState(isCommander && user?.baseId ? user.baseId : null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Lists
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);

  // Assignment Modal & State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [asgBaseId, setAsgBaseId] = useState(user?.baseId || 1);
  const [asgAssetId, setAsgAssetId] = useState('');
  const [asgSoldierName, setAsgSoldierName] = useState('Staff Sgt. Marcus Kane');
  const [asgRank, setAsgRank] = useState('Staff Sergeant');
  const [asgServiceId, setAsgServiceId] = useState('USA-INF-8812');
  const [asgUnit, setAsgUnit] = useState('82nd Airborne Division / 2nd Recon');
  const [asgQuantity, setAsgQuantity] = useState(1);
  const [asgReturnDate, setAsgReturnDate] = useState('');
  const [asgNotes, setAsgNotes] = useState('');
  const [asgLoading, setAsgLoading] = useState(false);
  const [asgError, setAsgError] = useState(null);
  const [asgSuccess, setAsgSuccess] = useState(null);

  // Return Modal State
  const [returnItem, setReturnItem] = useState(null);
  const [returnCondition, setReturnCondition] = useState('EXCELLENT');
  const [returnNotes, setReturnNotes] = useState('Returned in verified working order.');
  const [returnLoading, setReturnLoading] = useState(false);

  // Expenditure Modal & State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expBaseId, setExpBaseId] = useState(user?.baseId || 1);
  const [expAssetId, setExpAssetId] = useState('');
  const [expQuantity, setExpQuantity] = useState(10);
  const [expMission, setExpMission] = useState('Live Fire Assault & Target Qualification Drill');
  const [expOfficer, setExpOfficer] = useState('Gen. Marcus Vance');
  const [expRemarks, setExpRemarks] = useState('Munitions consumed with 100% target destruction.');
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState(null);
  const [expSuccess, setExpSuccess] = useState(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateParams();
      const params = {
        baseId: selectedBase || undefined,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const [asgRes, expRes] = await Promise.all([
        assignmentsApi.getAssignments(params),
        expendituresApi.getExpenditures(params),
      ]);

      if (asgRes.success) setAssignments(asgRes.data || []);
      if (expRes.success) setExpenditures(expRes.data || []);
    } catch (err) {
      console.error('Failed to load assignments or expenditures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBase, selectedCategory, dateRange]);

  useEffect(() => {
    const loadBasesAndAssets = async () => {
      try {
        const [bRes, aRes] = await Promise.all([
          basesApi.getAllBases(),
          assetsApi.getAllAssets(),
        ]);
        if (bRes.success) setBases(bRes.data || []);
        if (aRes.success) {
          setAssets(aRes.data || []);
          if (aRes.data.length > 0) {
            setAsgAssetId(aRes.data[0].id);
            // Default expendable asset to ammunition
            const expendable = aRes.data.find(a => a.isExpendable) || aRes.data[0];
            setExpAssetId(expendable.id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadBasesAndAssets();
  }, []);

  // Handle Assign Form Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAsgLoading(true);
    setAsgError(null);
    setAsgSuccess(null);

    try {
      const payload = {
        assignmentCode: `ASG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        baseId: Number(asgBaseId),
        assetId: Number(asgAssetId),
        assignedToName: asgSoldierName,
        assignedToRank: asgRank,
        assignedToServiceId: asgServiceId,
        unitOrSquadron: asgUnit,
        quantity: Number(asgQuantity),
        assignedDate: new Date().toISOString(),
        expectedReturnDate: asgReturnDate || null,
        conditionOnIssue: 'EXCELLENT',
        notes: asgNotes,
      };

      const res = await assignmentsApi.assignAsset(payload);
      if (res.success) {
        setAsgSuccess('Asset assigned to soldier successfully! Inventory updated.');
        fetchData();
        setTimeout(() => {
          setIsAssignModalOpen(false);
          setAsgSuccess(null);
        }, 1200);
      }
    } catch (err) {
      setAsgError(err.message || 'Failed to assign asset.');
    } finally {
      setAsgLoading(false);
    }
  };

  // Handle Return Asset Submit
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnItem) return;
    setReturnLoading(true);

    try {
      const res = await assignmentsApi.returnAsset(returnItem.id, {
        returnedDate: new Date().toISOString(),
        conditionOnReturn: returnCondition,
        notes: returnNotes,
      });
      if (res.success) {
        fetchData();
        setReturnItem(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to return asset.');
    } finally {
      setReturnLoading(false);
    }
  };

  // Handle Expenditure Form Submit
  const handleExpSubmit = async (e) => {
    e.preventDefault();
    setExpLoading(true);
    setExpError(null);
    setExpSuccess(null);

    try {
      const payload = {
        expenditureCode: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        baseId: Number(expBaseId),
        assetId: Number(expAssetId),
        quantity: Number(expQuantity),
        expendedDate: new Date().toISOString(),
        missionOrExercise: expMission,
        authorizedOfficer: expOfficer,
        remarks: expRemarks,
      };

      const res = await expendituresApi.recordExpenditure(payload);
      if (res.success) {
        setExpSuccess('Expenditure logged! Munitions deducted and closing balance recalculated.');
        fetchData();
        setTimeout(() => {
          setIsExpModalOpen(false);
          setExpSuccess(null);
        }, 1200);
      }
    } catch (err) {
      setExpError(err.message || 'Failed to record expenditure.');
    } finally {
      setExpLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.assignmentCode?.toLowerCase().includes(term) ||
      a.assignedToName?.toLowerCase().includes(term) ||
      a.assignedToServiceId?.toLowerCase().includes(term) ||
      a.unitOrSquadron?.toLowerCase().includes(term) ||
      a.asset?.name?.toLowerCase().includes(term) ||
      a.base?.name?.toLowerCase().includes(term)
    );
  });

  const filteredExpenditures = expenditures.filter(e => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.expenditureCode?.toLowerCase().includes(term) ||
      e.missionOrExercise?.toLowerCase().includes(term) ||
      e.authorizedOfficer?.toLowerCase().includes(term) ||
      e.asset?.name?.toLowerCase().includes(term) ||
      e.base?.name?.toLowerCase().includes(term)
    );
  });

  const assignmentExportCols = [
    { header: 'Code', accessor: a => a.assignmentCode },
    { header: 'Base', accessor: a => a.base?.name },
    { header: 'Soldier / Personnel', accessor: a => `${a.assignedToRank} ${a.assignedToName}` },
    { header: 'Service ID', accessor: a => a.assignedToServiceId },
    { header: 'Unit', accessor: a => a.unitOrSquadron },
    { header: 'Asset', accessor: a => a.asset?.name },
    { header: 'Qty', accessor: a => a.quantity },
    { header: 'Issue Date', accessor: a => a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : '' },
    { header: 'Status', accessor: a => a.status },
  ];

  const expenditureExportCols = [
    { header: 'Code', accessor: e => e.expenditureCode },
    { header: 'Base', accessor: e => e.base?.name },
    { header: 'Munitions / Asset', accessor: e => e.asset?.name },
    { header: 'Qty Expended', accessor: e => e.quantity },
    { header: 'Date', accessor: e => e.expendedDate ? new Date(e.expendedDate).toLocaleDateString() : '' },
    { header: 'Mission / Exercise', accessor: e => e.missionOrExercise },
    { header: 'Authorized By', accessor: e => e.authorizedOfficer },
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
          src={soldierBannerImg}
          alt="Personnel Asset Deployment"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '55%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
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
            <span className="badge-tactical badge-commander" style={{ fontSize: '0.7rem' }}>FIELD GEAR DEPLOYMENT</span>
          </div>
          <h1 className="font-military" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '0.04em' }}>
            ASSET ASSIGNMENTS & EXPENDITURES
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, maxWidth: '700px' }}>
            Deploy weapons & gear to military personnel, process field returns, and log munitions expenditures.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px', gap: '12px' }}>
        <ExportButton
          title={activeTab === 'assignments' ? 'Troop Assignments' : 'Munitions Expenditures'}
          columns={activeTab === 'assignments' ? assignmentExportCols : expenditureExportCols}
          data={activeTab === 'assignments' ? filteredAssignments : filteredExpenditures}
          filename={`mams_${activeTab}_report`}
        />

        {activeTab === 'assignments' ? (
          <button onClick={() => setIsAssignModalOpen(true)} className="btn-tactical btn-primary">
            <Plus size={16} /> Assign Gear to Soldier
          </button>
        ) : (
          <button onClick={() => setIsExpModalOpen(true)} className="btn-tactical btn-amber">
            <Flame size={16} /> Record Munitions Expended
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedBase={selectedBase}
        setSelectedBase={setSelectedBase}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={fetchData}
      />

      {/* Dual Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: activeTab === 'assignments' ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'assignments' ? '3px solid #7c3aed' : '3px solid transparent',
            color: activeTab === 'assignments' ? '#7c3aed' : 'var(--text-muted)',
            fontFamily: 'var(--font-military)',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
          }}
        >
          <UserCheck size={18} /> Active Troop Assignments ({assignments.filter(a => a.status === 'ACTIVE').length})
        </button>

        <button
          onClick={() => setActiveTab('expenditures')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: activeTab === 'expenditures' ? 'rgba(217, 119, 6, 0.12)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'expenditures' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'expenditures' ? '#d97706' : 'var(--text-muted)',
            fontFamily: 'var(--font-military)',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
          }}
        >
          <Flame size={18} /> Munitions & Asset Expenditures ({expenditures.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text-dim)" />
        <input
          type="text"
          className="input-tactical"
          style={{ background: 'transparent', border: 'none', padding: '0', fontSize: '0.9rem' }}
          placeholder={activeTab === 'assignments' ? 'Search by Soldier, Rank, Service ID, Unit, or Weapon...' : 'Search by Mission, Exercise, Asset, or Authorized Officer...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tab 1: Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>Loading assignments...</div>
            ) : filteredAssignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>No asset assignments found.</div>
            ) : (
              <table className="table-tactical">
                <thead>
                  <tr>
                    <th>ASSIGNMENT CODE</th>
                    <th>BASE</th>
                    <th>SOLDIER / OFFICER</th>
                    <th>SERVICE ID</th>
                    <th>UNIT / SQUADRON</th>
                    <th>ASSIGNED ASSET</th>
                    <th>QTY</th>
                    <th>ISSUED DATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-mono" style={{ color: '#ea580c', fontWeight: 600 }}>{a.assignmentCode}</td>
                      <td>{a.base?.name}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.assignedToName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{a.assignedToRank}</div>
                      </td>
                      <td className="font-mono" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{a.assignedToServiceId}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{a.unitOrSquadron}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.asset?.name}</td>
                      <td className="font-military" style={{ color: '#7c3aed', fontWeight: 700 }}>{a.quantity}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge-tactical ${a.status === 'ACTIVE' ? 'badge-warning' : 'badge-success'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {a.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setReturnItem(a)}
                            className="btn-tactical btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                          >
                            <RotateCcw size={12} /> Return Asset
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Returned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Expenditures Table */}
      {activeTab === 'expenditures' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)', fontWeight: 500 }}>Loading expenditure logs...</div>
            ) : filteredExpenditures.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)', fontWeight: 500 }}>No expenditure records found.</div>
            ) : (
              <table className="table-tactical">
                <thead>
                  <tr>
                    <th>EXPENDITURE CODE</th>
                    <th>BASE</th>
                    <th>ASSET / MUNITIONS</th>
                    <th>QTY EXPENDED</th>
                    <th>DATE EXPENDED</th>
                    <th>COMBAT MISSION / EXERCISE</th>
                    <th>AUTHORIZED OFFICER</th>
                    <th>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenditures.map((e) => (
                    <tr key={e.id}>
                      <td className="font-mono" style={{ color: '#d97706', fontWeight: 700 }}>{e.expenditureCode}</td>
                      <td>{e.base?.name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{e.asset?.name}</td>
                      <td className="font-military" style={{ color: '#dc2626', fontWeight: 700 }}>-{e.quantity}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {e.expendedDate ? new Date(e.expendedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ color: '#ea580c', fontWeight: 700 }}>{e.missionOrExercise}</td>
                      <td>
                        <span className="badge-tactical badge-commander">{e.authorizedOfficer}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '250px', fontWeight: 500 }}>{e.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal: Assign Asset */}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
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
                <UserCheck size={20} color="var(--accent-purple)" />
                <h3 className="font-military" style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  ASSIGN DEFENSE ASSET TO PERSONNEL
                </h3>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {asgError && <div style={{ padding: '10px', background: 'rgba(220,38,38,0.12)', color: '#dc2626', borderRadius: '6px' }}>{asgError}</div>}
              {asgSuccess && <div style={{ padding: '10px', background: 'rgba(5,150,105,0.12)', color: '#059669', borderRadius: '6px' }}>{asgSuccess}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Military Base</label>
                  <select className="select-tactical" value={asgBaseId} onChange={(e) => setAsgBaseId(e.target.value)} required>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Select Equipment to Issue</label>
                  <select className="select-tactical" value={asgAssetId} onChange={(e) => setAsgAssetId(e.target.value)} required>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Soldier / Officer Full Name</label>
                  <input type="text" className="input-tactical" value={asgSoldierName} onChange={(e) => setAsgSoldierName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Rank</label>
                  <input type="text" className="input-tactical" value={asgRank} onChange={(e) => setAsgRank(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Service ID Number</label>
                  <input type="text" className="input-tactical font-mono" value={asgServiceId} onChange={(e) => setAsgServiceId(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Unit / Squadron / Battalion</label>
                  <input type="text" className="input-tactical" value={asgUnit} onChange={(e) => setAsgUnit(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quantity</label>
                  <input type="number" min="1" className="input-tactical" value={asgQuantity} onChange={(e) => setAsgQuantity(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Expected Return Date</label>
                  <input type="date" className="input-tactical" value={asgReturnDate} onChange={(e) => setAsgReturnDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes / Deployment Orders</label>
                <textarea className="textarea-tactical" rows="2" value={asgNotes} onChange={(e) => setAsgNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn-tactical btn-secondary">Cancel</button>
                <button type="submit" disabled={asgLoading} className="btn-tactical btn-primary">{asgLoading ? 'Processing...' : 'Confirm Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Return Asset */}
      {returnItem && (
        <div className="modal-overlay" onClick={() => setReturnItem(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--modal-header-bg)',
            }}>
              <h3 className="font-military" style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                RETURN ASSET TO BASE INVENTORY
              </h3>
              <button onClick={() => setReturnItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--pill-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Asset Being Returned:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{returnItem.asset?.name} ({returnItem.quantity} unit)</div>
                <div style={{ fontSize: '0.8rem', color: '#ea580c', marginTop: '2px', fontWeight: 600 }}>Soldier: {returnItem.assignedToRank} {returnItem.assignedToName}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Condition on Return</label>
                <select className="select-tactical" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)}>
                  <option value="EXCELLENT">EXCELLENT (Combat Ready)</option>
                  <option value="GOOD">GOOD (Normal Wear)</option>
                  <option value="NEEDS_MAINTENANCE">NEEDS MAINTENANCE / SERVICE</option>
                  <option value="DAMAGED">DAMAGED (Log for Repair)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Inspection Remarks</label>
                <textarea className="textarea-tactical" rows="2" value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setReturnItem(null)} className="btn-tactical btn-secondary">Cancel</button>
                <button type="submit" disabled={returnLoading} className="btn-tactical btn-emerald">{returnLoading ? 'Processing...' : 'Complete Return'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Expenditure */}
      {isExpModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExpModalOpen(false)}>
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
                <Flame size={20} color="var(--accent-amber)" />
                <h3 className="font-military" style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  RECORD MUNITIONS / ASSET EXPENDITURE
                </h3>
              </div>
              <button onClick={() => setIsExpModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExpSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {expError && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '6px' }}>{expError}</div>}
              {expSuccess && <div style={{ padding: '10px', background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: '6px' }}>{expSuccess}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Military Base</label>
                  <select className="select-tactical" value={expBaseId} onChange={(e) => setExpBaseId(e.target.value)} required>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Select Munitions / Asset</label>
                  <select className="select-tactical" value={expAssetId} onChange={(e) => setExpAssetId(e.target.value)} required>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} {a.isExpendable ? '🔥 (Expendable)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quantity Expended</label>
                  <input type="number" min="1" className="input-tactical" value={expQuantity} onChange={(e) => setExpQuantity(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Authorizing Commanding Officer</label>
                  <input type="text" className="input-tactical" value={expOfficer} onChange={(e) => setExpOfficer(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Combat Mission / Tactical Exercise Name</label>
                <input type="text" className="input-tactical" value={expMission} onChange={(e) => setExpMission(e.target.value)} placeholder="e.g. Operation Northern Strike, Live Fire Exercise" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Remarks / After Action Report</label>
                <textarea className="textarea-tactical" rows="2" value={expRemarks} onChange={(e) => setExpRemarks(e.target.value)} placeholder="After action report notes, expended round count, targets destroyed..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsExpModalOpen(false)} className="btn-tactical btn-secondary">Cancel</button>
                <button type="submit" disabled={expLoading} className="btn-tactical btn-amber">{expLoading ? 'Recording...' : 'Log Munitions Expended'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsExpendituresPage;
