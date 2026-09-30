import axios from './frontend/node_modules/axios/index.js';

const BASE_URL = 'http://localhost:8081/api';

console.log('Running MAMS Integration Test Suite...\n');

let adminToken = '';
let commanderToken = '';
let logisticsToken = '';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  try {
    // 1. Health Check
    console.log('1. Testing System Health API...');
    const health = await axios.get(`${BASE_URL}/health`);
    assert(health.data.success === true, 'Health check returned success: true');
    assert(health.data.data.includes('Operational'), 'API status is Operational');

    // 2. Authentication & RBAC Login Tests
    console.log('\n2. Testing Authentication & Role-Based Access Control (RBAC)...');
    
    // Admin Login
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'password123',
    });
    assert(adminLogin.data.success === true, 'Admin login successful');
    assert(adminLogin.data.data.role === 'ADMIN', 'Admin role verified (ADMIN)');
    adminToken = adminLogin.data.data.token;
    assert(adminToken.length > 20, 'Admin JWT token generated');

    // Base Commander Login
    const cmdLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'commander_liberty',
      password: 'password123',
    });
    assert(cmdLogin.data.success === true, 'Base Commander login successful');
    assert(cmdLogin.data.data.role === 'BASE_COMMANDER', 'Commander role verified (BASE_COMMANDER)');
    assert(cmdLogin.data.data.baseId === 1, 'Commander assigned to Fort Liberty (Base 1)');
    commanderToken = cmdLogin.data.data.token;

    // Logistics Officer Login
    const logLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'logistics_liberty',
      password: 'password123',
    });
    assert(logLogin.data.success === true, 'Logistics Officer login successful');
    assert(logLogin.data.data.role === 'LOGISTICS_OFFICER', 'Logistics Officer role verified');
    logisticsToken = logLogin.data.data.token;

    // User Registration Test
    const newUsername = `officer_${Date.now().toString().slice(-4)}`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      username: newUsername,
      password: 'password123',
      fullName: 'Lt. Colonel Thomas Mitchell',
      militaryRank: 'Lt. Colonel',
      serviceNumber: `USA-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${newUsername}@mams.mil`,
      role: 'BASE_COMMANDER',
      baseId: 2,
    });
    assert(regRes.data.success === true, `New officer registered: ${newUsername}`);

    const newOfficerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: newUsername,
      password: 'password123',
    });
    assert(newOfficerLogin.data.success === true, 'New registered officer successfully authenticated with JWT');

    const adminAuthHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 3. Dashboard Metrics & Mathematical Ledger Equations
    console.log('\n3. Testing Dashboard Key Metrics & Formula Verification...');
    const metricsRes = await axios.get(`${BASE_URL}/dashboard/metrics`, adminAuthHeader);
    assert(metricsRes.data.success === true, 'Retrieved dashboard metrics');
    const m = metricsRes.data.data;
    console.log(`     - Opening Balance: ${m.openingBalance}`);
    console.log(`     - Total Purchases: ${m.totalPurchases}`);
    console.log(`     - Transfers In:    ${m.totalTransfersIn}`);
    console.log(`     - Transfers Out:   ${m.totalTransfersOut}`);
    console.log(`     - Net Movement:    ${m.netMovement}`);
    console.log(`     - Assigned:        ${m.assignedAssets}`);
    console.log(`     - Expended:        ${m.expendedAssets}`);
    console.log(`     - Closing Balance: ${m.closingBalance}`);

    // Verify Mathematical Invariant: Net Movement = Purchases + Transfers In - Transfers Out
    assert(m.netMovement === (m.totalPurchases + m.totalTransfersIn - m.totalTransfersOut),
      `Net Movement (${m.netMovement}) equals Purchases (${m.totalPurchases}) + Transfers In (${m.totalTransfersIn}) - Transfers Out (${m.totalTransfersOut})`);

    // Verify Mathematical Invariant: Closing Balance = Opening Balance + Net Movement - Expended Assets
    assert(m.closingBalance === (m.openingBalance + m.netMovement - m.expendedAssets),
      `Closing Balance (${m.closingBalance}) equals Opening (${m.openingBalance}) + Net Movement (${m.netMovement}) - Expended (${m.expendedAssets})`);

    // 4. Net Movement Drilldown Pop-up Data
    console.log('\n4. Testing Net Movement Drilldown API (Bonus Feature)...');
    const netDetailsRes = await axios.get(`${BASE_URL}/dashboard/net-movement-details`, adminAuthHeader);
    assert(netDetailsRes.data.success === true, 'Retrieved Net Movement drilldown details');
    const nd = netDetailsRes.data.data;
    assert(Array.isArray(nd.purchases), `Purchases array contains ${nd.purchases.length} records`);
    assert(Array.isArray(nd.transfersIn), `Transfers In array contains ${nd.transfersIn.length} records`);
    assert(Array.isArray(nd.transfersOut), `Transfers Out array contains ${nd.transfersOut.length} records`);

    // 5. Purchases Recording & Ledger Inflow
    console.log('\n5. Testing Purchase Order Creation & Database Inflow...');
    const testPoNum = `PO-TEST-${Date.now()}`;
    const purchasePayload = {
      purchaseOrderNumber: testPoNum,
      baseId: 1, // Fort Liberty
      assetId: 1, // M4A1 Tactical Carbine
      quantity: 25,
      unitCost: 1450.00,
      supplier: 'Colt Defense Systems HQ',
      purchaseDate: new Date().toISOString(),
      notes: 'Automated integration test acquisition batch.',
    };

    const purchaseRes = await axios.post(`${BASE_URL}/purchases`, purchasePayload, adminAuthHeader);
    assert(purchaseRes.data.success === true, `Recorded purchase order: ${testPoNum} (25 units)`);

    // Verify purchase appears in filter query
    const filterPurchases = await axios.get(`${BASE_URL}/purchases?baseId=1&categoryId=1`, adminAuthHeader);
    const foundPurchase = filterPurchases.data.data.find(p => p.purchaseOrderNumber === testPoNum);
    assert(!!foundPurchase, 'Verified purchase exists in database with baseId=1 and categoryId=1');

    // 6. Inter-Base Transfer Lifecycle
    console.log('\n6. Testing Inter-Base Transfer Dispatch & Destination Inflow...');
    const testTrfNum = `TRF-TEST-${Date.now()}`;
    const transferPayload = {
      transferNumber: testTrfNum,
      sourceBaseId: 1, // Fort Liberty
      destinationBaseId: 2, // Camp Pendleton
      assetId: 1, // M4A1
      quantity: 10,
      dispatchedAt: new Date().toISOString(),
      reasonOrMission: 'Rebalancing tactical weapons pool for live deployment.',
    };

    const transferRes = await axios.post(`${BASE_URL}/transfers`, transferPayload, adminAuthHeader);
    assert(transferRes.data.success === true, `Initiated transfer ${testTrfNum} (10 units from Base 1 to Base 2)`);

    const transferList = await axios.get(`${BASE_URL}/transfers`, adminAuthHeader);
    const foundTransfer = transferList.data.data.find(t => t.transferNumber === testTrfNum);
    assert(!!foundTransfer, 'Verified transfer record in database transfer history');
    assert(foundTransfer.status === 'COMPLETED', 'Transfer status is COMPLETED');

    // 7. Asset Assignment to Personnel & Field Return
    console.log('\n7. Testing Troop Asset Assignment & Return Lifecycle...');
    const testAsgCode = `ASG-TEST-${Date.now()}`;
    const assignPayload = {
      assignmentCode: testAsgCode,
      baseId: 1,
      assetId: 1,
      assignedToName: 'Captain James T. Kirk',
      assignedToRank: 'Captain',
      assignedToServiceId: 'USA-SPEC-007',
      unitOrSquadron: '1st Special Operations Recon',
      quantity: 2,
      assignedDate: new Date().toISOString(),
      expectedReturnDate: '2026-11-30',
      conditionOnIssue: 'EXCELLENT',
      notes: 'Issued for tactical field exercise.',
    };

    const assignRes = await axios.post(`${BASE_URL}/assignments`, assignPayload, adminAuthHeader);
    assert(assignRes.data.success === true, `Assigned asset: ${testAsgCode} to Captain James T. Kirk`);
    const createdAssignmentId = assignRes.data.data.id;

    // Return Asset
    const returnRes = await axios.post(`${BASE_URL}/assignments/${createdAssignmentId}/return`, {
      returnedDate: new Date().toISOString(),
      conditionOnReturn: 'EXCELLENT',
      notes: 'Returned in full working condition after operation.',
    }, adminAuthHeader);
    assert(returnRes.data.success === true, 'Returned asset back to base inventory');
    assert(returnRes.data.data.status === 'RETURNED', 'Assignment status updated to RETURNED');

    // 8. Munitions & Asset Expenditures
    console.log('\n8. Testing Asset & Munitions Expenditure Logging...');
    const testExpCode = `EXP-TEST-${Date.now()}`;
    const expPayload = {
      expenditureCode: testExpCode,
      baseId: 1,
      assetId: 1, // M4A1
      quantity: 5,
      expendedDate: new Date().toISOString(),
      missionOrExercise: 'Live Fire Target Destruction Drill Alpha',
      authorizedOfficer: 'Gen. Marcus Vance',
      remarks: '5 units decommissioned/expended during qualification.',
    };

    const expRes = await axios.post(`${BASE_URL}/expenditures`, expPayload, adminAuthHeader);
    assert(expRes.data.success === true, `Recorded expenditure: ${testExpCode} (15 crates expended)`);

    // 9. Master Inventory Stock Ledger Verification
    console.log('\n9. Testing Master Inventory Stock Ledger...');
    const invRes = await axios.get(`${BASE_URL}/inventory`, adminAuthHeader);
    assert(invRes.data.success === true, 'Retrieved master inventory stock ledger');
    const fortLibertyM4 = invRes.data.data.find(i => i.base.id === 1 && i.asset.id === 1);
    assert(!!fortLibertyM4, 'Fort Liberty M4A1 inventory ledger entry verified');
    console.log(`     Fort Liberty M4A1: Opening=${fortLibertyM4.openingBalance}, Purchased=+${fortLibertyM4.totalPurchased}, TransferredIn=+${fortLibertyM4.totalTransferredIn}, TransferredOut=-${fortLibertyM4.totalTransferredOut}, Closing=${fortLibertyM4.closingBalance}`);

    // 10. Audit Trail Verification
    console.log('\n10. Testing Tamper-Proof Audit Trail Logging...');
    const auditRes = await axios.get(`${BASE_URL}/audit-logs`, adminAuthHeader);
    assert(auditRes.data.success === true, 'Retrieved audit logs');
    assert(auditRes.data.data.length > 0, `Audit log entries count: ${auditRes.data.data.length}`);
    const recentPurchaseLog = auditRes.data.data.find(l => l.action === 'PURCHASE_RECORDED' && l.entityId === testPoNum);
    assert(!!recentPurchaseLog, `Audit log found for purchase ${testPoNum}`);
    const recentTransferLog = auditRes.data.data.find(l => l.action === 'TRANSFER_COMPLETED' && l.entityId === testTrfNum);
    assert(!!recentTransferLog, `Audit log found for transfer ${testTrfNum}`);
    const recentExpLog = auditRes.data.data.find(l => l.action === 'ASSET_EXPENDED' && l.entityId === testExpCode);
    assert(!!recentExpLog, `Audit log found for expenditure ${testExpCode}`);

    console.log(`\nTest Suites: 1 passed, 1 total`);
    console.log(`Tests:       ${passedTests} passed, ${totalTests} total`);
    console.log(`Status:      All integration tests passing.\n`);

  } catch (err) {
    console.error('\nTest suite failed:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response.data);
    }
    process.exit(1);
  }
}

runTests();
