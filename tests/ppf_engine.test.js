import assert from "assert";
import { calculatePPF } from "../frontend/src/helper/financialCalculators.js";

console.log("--- RUNNING STATUTORY PPF ENGINE TEST SUITE ---");

// Test 1: Standard statutory 15-year annual deposit of Rs 1,50,000 at 7.1%
console.log("Test 1: Standard 15-Year Annual Deposit (₹1,50,000 @ 7.1%)");
{
  const result = calculatePPF(150000, 7.1, 15, 'annual');
  assert.strictEqual(result.totalInvested, 2250000, "Total invested should be 22.5 Lakhs");
  assert.strictEqual(result.invested, 2250000, "invested alias should match totalInvested");
  assert.strictEqual(result.principal, 2250000, "principal alias should match totalInvested");
  
  // Standard Indian PPF maturity value for 1.5L annual deposit at 7.1% is approx Rs 40.68 Lakhs
  assert(result.maturityAmount > 4000000 && result.maturityAmount < 4100000, `Maturity amount ₹${result.maturityAmount} should be ~40.68L`);
  assert.strictEqual(result.finalValue, result.maturityAmount, "finalValue alias should match maturityAmount");
  assert.strictEqual(result.totalValue, result.maturityAmount, "totalValue alias should match maturityAmount");
  assert.strictEqual(result.interestEarned, result.maturityAmount - result.totalInvested, "interestEarned should be maturity - invested");
  assert.strictEqual(result.schedule.length, 15, "Schedule should have 15 annual entries");
  
  // Verify schedule continuity
  for (let i = 0; i < result.schedule.length; i++) {
    const entry = result.schedule[i];
    assert.strictEqual(entry.year, i + 1);
    assert.strictEqual(entry.deposit, 150000);
    if (i > 0) {
      assert.strictEqual(entry.openingBalance, result.schedule[i - 1].closingBalance, "Opening balance must match previous year closing balance");
    }
  }
}

// Test 2: Statutory Annual Max Deposit Cap (Rs 1,50,000 per financial year)
console.log("Test 2: Statutory Cap Enforcement (Excess deposits capped at ₹1,50,000)");
{
  const cappedResult = calculatePPF(500000, 7.1, 15, 'annual');
  assert.strictEqual(cappedResult.totalInvested, 2250000, "Should cap annual deposit at ₹1,50,000 (total ₹22,50,000)");
  assert.strictEqual(cappedResult.maxLimitPerYear, 150000);
}

// Test 3: Monthly Deposit Mode (e.g., Rs 10,000 per month)
console.log("Test 3: Monthly Deposit Mode (₹10,000/month)");
{
  const monthlyResult = calculatePPF(10000, 7.1, 15, 'monthly');
  assert.strictEqual(monthlyResult.totalInvested, 1800000, "Total invested should be 10000 * 12 * 15 = ₹18,00,000");
  assert(monthlyResult.interestEarned > 1300000, "Interest earned should be substantial over 15 years");
  assert.strictEqual(monthlyResult.maturityAmount, monthlyResult.totalInvested + monthlyResult.interestEarned);
  assert.strictEqual(monthlyResult.frequency, 'monthly');
}

// Test 4: Custom tenure and rate (e.g., 20-year extension at 7.1%)
console.log("Test 4: Extended tenure (20 years)");
{
  const extendedResult = calculatePPF(100000, 7.1, 20, 'annual');
  assert.strictEqual(extendedResult.years, 20);
  assert.strictEqual(extendedResult.schedule.length, 20);
  assert.strictEqual(extendedResult.totalInvested, 2000000);
  assert(extendedResult.maturityAmount > extendedResult.totalInvested);
}

console.log("✅ ALL PPF STATUTORY ENGINE TESTS PASSED FLAWLESSLY!\\n");
