import assert from 'node:assert/strict';
import {
  calculateTax,
  calculateAdvancedTax,
  AVAILABLE_ASSESSMENT_YEARS,
  DEFAULT_ASSESSMENT_YEAR,
  TAX_YEAR_CONFIGS
} from '../frontend/src/helper/financialCalculators.js';

console.log('--- RUNNING VERSIONED INDIAN TAX ENGINE TEST SUITE ---');

// 1. ASSESSMENT YEAR CONFIGURATIONS
console.log('Test 1: Verification of Configured Assessment Years');
assert.ok(Array.isArray(AVAILABLE_ASSESSMENT_YEARS), 'Available assessment years array exists');
assert.equal(DEFAULT_ASSESSMENT_YEAR, 'AY 2025-26', 'Default assessment year must be AY 2025-26');
assert.ok(TAX_YEAR_CONFIGS['AY 2025-26'], 'AY 2025-26 config exists');
assert.ok(TAX_YEAR_CONFIGS['AY 2026-27'], 'AY 2026-27 config exists');
assert.ok(TAX_YEAR_CONFIGS['AY 2024-25'], 'AY 2024-25 config exists');

// 2. NEW REGIME AY 2025-26 (FINANCE (NO. 2) ACT 2024) SLABS & BOUNDARIES
console.log('Test 2: AY 2025-26 New Regime Slab Boundaries');

// Zero income
const zeroTax = calculateTax(0, 'new', 'AY 2025-26');
assert.equal(zeroTax.total, 0, 'Zero income has 0 tax');
assert.equal(zeroTax.standardDeduction, 75000, 'Standard deduction for AY 2025-26 is 75,000');

// Exact 3,00,000 (First slab boundary: 0 - 3L is Nil)
const tax3L = calculateTax(300000, 'new', 'AY 2025-26');
assert.equal(tax3L.tax, 0, '3L taxable has 0 tax');
assert.equal(tax3L.total, 0);

// Just above 3,00,000 (3,00,001) - before 87A rebate
const tax3L1 = calculateTax(300001, 'new', 'AY 2025-26');
assert.equal(tax3L1.total, 0, 'Income <= 7L has 0 tax after Section 87A rebate');

// Exact 7,00,000 (Section 87A rebate boundary)
// Base slab tax: (7,00,000 - 3,00,000) * 0.05 = 20,000.
// Under Section 87A rebate: 20,000 is 100% rebated, tax = 0!
const tax7L = calculateTax(700000, 'new', 'AY 2025-26');
assert.equal(tax7L.tax, 0, 'Tax at 7L is 0 after Section 87A rebate');
assert.equal(tax7L.total, 0, 'Total tax at 7L is 0');
assert.equal(tax7L.rebate87A, 20000, 'Section 87A rebate applied is 20,000');

// Just above 7,00,000 (7,00,100) - Marginal relief test
// Excess income = 100. Tax cannot exceed excess income (100).
const tax7L100 = calculateTax(700100, 'new', 'AY 2025-26');
assert.ok(tax7L100.tax <= 100, 'Marginal relief caps base tax at excess income');

// 10,00,000 (Boundary of 10% slab)
// 0-3L: 0
// 3-7L: 5% of 4L = 20,000
// 7-10L: 10% of 3L = 30,000
// Base tax = 50,000. Cess = 4% of 50,000 = 2,000. Total = 52,000.
const tax10L = calculateTax(1000000, 'new', 'AY 2025-26');
assert.equal(tax10L.tax, 50000, '10L base tax is 50,000');
assert.equal(tax10L.cess, 2000, '10L cess is 2,000');
assert.equal(tax10L.total, 52000, '10L total tax is 52,000');

// 12,00,000 (Boundary of 15% slab)
// 0-3L: 0
// 3-7L: 20,000
// 7-10L: 30,000
// 10-12L: 15% of 2L = 30,000
// Base tax = 80,000. Cess = 3,200. Total = 83,200.
const tax12L = calculateTax(1200000, 'new', 'AY 2025-26');
assert.equal(tax12L.tax, 80000, '12L base tax is 80,000');
assert.equal(tax12L.cess, 3200, '12L cess is 3,200');
assert.equal(tax12L.total, 83200, '12L total tax is 83,200');

// 15,00,000 (Boundary of 20% slab)
// 0-3L: 0
// 3-7L: 20,000
// 7-10L: 30,000
// 10-12L: 30,000
// 12-15L: 20% of 3L = 60,000
// Base tax = 1,40,000. Cess = 5,600. Total = 1,45,600.
const tax15L = calculateTax(1500000, 'new', 'AY 2025-26');
assert.equal(tax15L.tax, 140000, '15L base tax is 1,40,000');
assert.equal(tax15L.cess, 5600, '15L cess is 5,600');
assert.equal(tax15L.total, 145600, '15L total tax is 1,45,600');

// Above 15,00,000: 20,00,000 (30% slab)
// 0-15L: 1,40,000
// 15-20L: 30% of 5L = 1,50,000
// Base tax = 2,90,000. Cess = 11,600. Total = 3,01,600.
const tax20L = calculateTax(2000000, 'new', 'AY 2025-26');
assert.equal(tax20L.tax, 290000, '20L base tax is 2,90,000');
assert.equal(tax20L.cess, 11600, '20L cess is 11,600');
assert.equal(tax20L.total, 301600, '20L total tax is 3,01,600');

// 3. OLD REGIME COMPARISON (AY 2025-26)
console.log('Test 3: Old Regime Slabs & Section 87A Rebate');
// 0 - 2.5L: Nil
// 2.5 - 5L: 5% (up to 12,500 - rebated under 87A if taxable <= 5L)
const old5L = calculateTax(500000, 'old', 'AY 2025-26');
assert.equal(old5L.total, 0, 'Old regime <= 5L pays 0 tax under Section 87A');

// 10,00,000 in Old Regime:
// 2.5-5L: 12,500
// 5-10L: 20% of 5L = 1,00,000
// Base tax = 1,12,500. Cess = 4,500. Total = 1,17,000.
const old10L = calculateTax(1000000, 'old', 'AY 2025-26');
assert.equal(old10L.tax, 112500);
assert.equal(old10L.cess, 4500);
assert.equal(old10L.total, 117000);

// 4. VERSIONED YEAR SWITCHING (AY 2024-25 HISTORICAL FRAMEWORK)
console.log('Test 4: Versioned Year Switching (AY 2024-25 vs AY 2025-26)');
// In AY 2024-25, slabs were: 3-6L 5%, 6-9L 10%, 9-12L 15%.
// 12L base tax was: 15,000 + 30,000 + 45,000 = 90,000. Total = 93,600.
const tax12LPrev = calculateTax(1200000, 'new', 'AY 2024-25');
assert.equal(tax12LPrev.tax, 90000, 'AY 2024-25 base tax for 12L is 90,000');
assert.equal(tax12LPrev.total, 93600, 'AY 2024-25 total tax for 12L is 93,600');

// In AY 2025-26, same 12L income pays 83,200 (a tax reduction of 10,400 due to revised 3-7L slab).
assert.equal(tax12L.total, 83200);
assert.equal(tax12LPrev.total - tax12L.total, 10400, 'Taxpayer saves 10,400 under AY 2025-26 Finance Act 2024 revision');

// 5. ADVANCED TAX ENGINE WITH DEDUCTIONS
console.log('Test 5: Advanced Tax Engine Comparison and Regime Recommendation');
const advRes = calculateAdvancedTax({
  grossIncome: 1500000,
  sec80C: 150000,
  sec80D: 25000,
  hra: 100000,
  homeLoan: 150000,
  assessmentYear: 'AY 2025-26'
});

assert.ok(advRes.oldRegime, 'Old regime calculation present');
assert.ok(advRes.newRegime, 'New regime calculation present');
assert.equal(advRes.oldRegime.standardDeduction, 50000, 'Old regime SD is 50,000');
assert.equal(advRes.newRegime.standardDeduction, 75000, 'New regime SD is 75,000');
assert.ok(['old', 'new'].includes(advRes.recommendedRegime), 'Regime recommendation produced');

console.log('\n✅ ALL VERSIONED TAX ENGINE TESTS PASSED FLAWLESSLY!\n');
