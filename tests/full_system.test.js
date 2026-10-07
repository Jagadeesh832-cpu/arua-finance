import assert from 'node:assert/strict';
import {
  calculateTax,
  calculateAdvancedTax,
  calculateHRA,
  calculateAdvanceTax,
  calculateInterest,
  calculateSIP,
  calculateFD,
  calculatePPF,
  calculateLumpsum,
  calculateEmergencyFund
} from '../frontend/src/helper/financialCalculators.js';
import { AnomalyService } from '../backend/anomaly.service.js';
import { SmsService } from '../backend/sms.service.js';
import { normalizePhoneNumber, normalizeEmail } from '../backend/user.controller.js';

console.log('--- RUNNING ARUA FINANCE AUTOMATED QA & INTEGRATION SUITE ---');

// TEST 1: Income Tax FY 2025-26 Slabs
console.log('Test 1: Income Tax FY 2025-26 Slabs');
const taxZero = calculateTax(650000, 'new');
assert.equal(taxZero.total, 0, 'New regime <= 7L should have 0 tax under Section 87A');

const tax12L = calculateTax(1200000, 'new');
assert.equal(tax12L.tax, 90000, 'New regime 12L base tax should be 90,000');
assert.equal(tax12L.cess, 3600, '4% Health & Education Cess should be 3,600');
assert.equal(tax12L.total, 93600, 'Total tax for 12L should be 93,600');

const taxOld5L = calculateTax(500000, 'old');
assert.equal(taxOld5L.total, 0, 'Old regime <= 5L should have 0 tax under Section 87A');

// TEST 2: Advanced Tax & Deductions Comparison
console.log('Test 2: Advanced Tax & Deductions Comparison');
const advTax = calculateAdvancedTax({
  grossIncome: 1500000,
  sec80C: 150000,
  sec80D: 25000,
  hra: 120000,
  homeLoan: 200000
});
assert.ok(advTax.oldRegime.total > 0, 'Old regime tax computed');
assert.ok(advTax.newRegime.total > 0, 'New regime tax computed');
assert.ok(['old', 'new'].includes(advTax.recommendedRegime), 'Regime recommendation produced');

// TEST 3: HRA Exemption Calculator
console.log('Test 3: HRA Exemption Calculator');
const hraRes = calculateHRA(600000, 240000, 180000, true);
assert.ok(hraRes.exemption > 0, 'HRA exemption calculated');
assert.ok(hraRes.taxableHRA >= 0, 'Taxable HRA calculated');

// TEST 4: SIP Compounding Calculator with Step-up
console.log('Test 4: SIP Compounding Calculator');
const sipRes = calculateSIP(5000, 12, 10, 0);
assert.equal(sipRes.totalInvested, 600000, 'SIP invested amount for 10 yrs is 6,00,000');
assert.ok(sipRes.finalValue > 1100000, '12% return for 10 yrs > 11 Lakhs');

// TEST 5: Fixed Deposit Calculator
console.log('Test 5: Fixed Deposit Calculator');
const fdRes = calculateFD(100000, 7.5, 5, 4);
assert.equal(fdRes.principal, 100000);
assert.ok(fdRes.maturityAmount > 140000, 'FD maturity > 1.4 Lakhs');

// TEST 6: PPF 15-Year EEE Calculator
console.log('Test 6: PPF 15-Year EEE Calculator');
const ppfRes = calculatePPF(150000, 7.1, 15);
assert.equal(ppfRes.totalInvested, 2250000);
assert.ok(ppfRes.maturityAmount > 4000000, 'PPF maturity > 40 Lakhs');

// TEST 7: Emergency Fund Fortress Calculator
console.log('Test 7: Emergency Fund Fortress Calculator');
const efRes = calculateEmergencyFund(30000, 90000);
assert.equal(efRes.min3Months, 90000);
assert.equal(efRes.rec6Months, 180000);
assert.equal(efRes.max12Months, 360000);
assert.equal(efRes.progressPct, 50);
assert.equal(efRes.shortfall, 90000);

// TEST 8: Phone Number Normalization & Sanitization
console.log('Test 8: Phone Number Normalization');
assert.equal(normalizePhoneNumber('9876543210'), '+919876543210');
assert.equal(normalizePhoneNumber('+91 98765 43210'), '+919876543210');
assert.equal(normalizePhoneNumber('09876543210'), '+919876543210');
assert.equal(normalizeEmail('  Investor@Arua.Finance  '), 'investor@arua.finance');

// TEST 9: Anomaly Detection Engine
console.log('Test 9: Anomaly Detection Engine');
const mockUser = {
  monthlyBudget: 25000,
  expenses: [
    { amount: 500, category: 'Food & Dining', date: new Date().toISOString() },
    { amount: 600, category: 'Food & Dining', date: new Date().toISOString() },
    { amount: 450, category: 'Food & Dining', date: new Date().toISOString() },
    { amount: 700, category: 'Transport', date: new Date().toISOString() },
    { amount: 550, category: 'Food & Dining', date: new Date().toISOString() }
  ]
};
const hugeExpense = { amount: 15000, category: 'Shopping', date: new Date().toISOString() };
const anomaly = AnomalyService.detectAnomaly(mockUser, hugeExpense);
assert.ok(anomaly.isAnomaly, 'Huge sudden expense flagged as anomaly');

// TEST 10: SMS Alert Formatting
console.log('Test 10: SMS Alert Formatting');
const thresholdSms = SmsService.formatThresholdMessage({ threshold: 90, budget: 50000, spent: 45000, remaining: 5000 });
assert.ok(thresholdSms.includes('90%'), 'Threshold SMS formatted with 90%');
assert.ok(thresholdSms.includes('ARUA FINANCE WARNING'), 'Standard SMS prefix included');

const dailySms = SmsService.formatDailySpendingMessage(3200);
assert.equal(dailySms, 'ARUA FINANCE: You spent ₹3,200 today.');

console.log('\n✅ ALL 10 QA & INTEGRATION TEST SUITES PASSED FLAWLESSLY!\n');
