/**
 * Arua Finance — Versioned Indian Income Tax Rules Architecture
 * Compliant with Income Tax Act, 1961 and Finance (No. 2) Act, 2024.
 * Authoritative official Government of India tax slabs & statutory rules.
 */

export const AVAILABLE_ASSESSMENT_YEARS = [
  { id: "AY 2025-26", label: "AY 2025-26 (FY 2024-25) — Current Official", isDefault: true },
  { id: "AY 2026-27", label: "AY 2026-27 (FY 2025-26) — Projected / Applicable", isDefault: false },
  { id: "AY 2024-25", label: "AY 2024-25 (FY 2023-24) — Previous Framework", isDefault: false }
];

export const DEFAULT_ASSESSMENT_YEAR = "AY 2025-26";

/**
 * Tax Rule Definitions per Assessment Year
 */
export const TAX_YEAR_CONFIGS = {
  "AY 2025-26": {
    name: "Assessment Year 2025-26",
    financialYear: "FY 2024-25",
    statutoryAct: "Finance (No. 2) Act, 2024",
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 700000, // Section 87A full rebate threshold
      rebate87AMax: 25000,
      hasMarginalRelief: true,
      slabs: [
        { min: 0, max: 300000, rate: 0.00 },
        { min: 300000, max: 700000, rate: 0.05 },
        { min: 700000, max: 1000000, rate: 0.10 },
        { min: 1000000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: Infinity, rate: 0.30 }
      ]
    },
    oldRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 500000,
      rebate87AMax: 12500,
      hasMarginalRelief: false,
      slabs: [
        { min: 0, max: 250000, rate: 0.00 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: Infinity, rate: 0.30 }
      ]
    },
    cessRate: 0.04 // 4% Health and Education Cess
  },

  "AY 2026-27": {
    name: "Assessment Year 2026-27",
    financialYear: "FY 2025-26",
    statutoryAct: "Income Tax Framework (Post-Finance Act 2024)",
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 700000,
      rebate87AMax: 25000,
      hasMarginalRelief: true,
      slabs: [
        { min: 0, max: 300000, rate: 0.00 },
        { min: 300000, max: 700000, rate: 0.05 },
        { min: 700000, max: 1000000, rate: 0.10 },
        { min: 1000000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: Infinity, rate: 0.30 }
      ]
    },
    oldRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 500000,
      rebate87AMax: 12500,
      hasMarginalRelief: false,
      slabs: [
        { min: 0, max: 250000, rate: 0.00 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: Infinity, rate: 0.30 }
      ]
    },
    cessRate: 0.04
  },

  "AY 2024-25": {
    name: "Assessment Year 2024-25",
    financialYear: "FY 2023-24",
    statutoryAct: "Finance Act, 2023",
    newRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 700000,
      rebate87AMax: 25000,
      hasMarginalRelief: true,
      slabs: [
        { min: 0, max: 300000, rate: 0.00 },
        { min: 300000, max: 600000, rate: 0.05 },
        { min: 600000, max: 900000, rate: 0.10 },
        { min: 900000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: Infinity, rate: 0.30 }
      ]
    },
    oldRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 500000,
      rebate87AMax: 12500,
      hasMarginalRelief: false,
      slabs: [
        { min: 0, max: 250000, rate: 0.00 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: Infinity, rate: 0.30 }
      ]
    },
    cessRate: 0.04
  }
};

/**
 * Computes base slab tax before rebate for a given taxable amount and slabs.
 */
function computeSlabTax(taxableIncome, slabs) {
  let tax = 0;
  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      tax += taxableInSlab * slab.rate;
    }
  }
  return tax;
}

/**
 * Calculates official income tax for a given income, regime, and assessment year.
 * @param {number} income - Net Taxable Income (after deductions & standard deduction)
 * @param {'new'|'old'} regime - Tax Regime
 * @param {string} assessmentYear - Selected AY ('AY 2025-26', 'AY 2026-27', 'AY 2024-25')
 */
export function calculateTaxEngine(income, regime = "new", assessmentYear = DEFAULT_ASSESSMENT_YEAR) {
  const taxable = Math.max(0, parseFloat(income) || 0);
  const normalizedYear = TAX_YEAR_CONFIGS[assessmentYear] ? assessmentYear : DEFAULT_ASSESSMENT_YEAR;
  const yearConfig = TAX_YEAR_CONFIGS[normalizedYear];
  const isNew = regime === "new";
  const regimeConfig = isNew ? yearConfig.newRegime : yearConfig.oldRegime;

  let baseTax = computeSlabTax(taxable, regimeConfig.slabs);
  let rebate87A = 0;

  // Section 87A Rebate logic
  if (taxable <= regimeConfig.rebate87ALimit) {
    rebate87A = Math.min(baseTax, regimeConfig.rebate87AMax);
    baseTax = 0;
  } else if (isNew && regimeConfig.hasMarginalRelief) {
    // Marginal relief under Section 87A for New Regime:
    // Tax payable cannot exceed excess income over rebate limit
    const excessIncome = taxable - regimeConfig.rebate87ALimit;
    if (baseTax > excessIncome) {
      const relief = baseTax - excessIncome;
      rebate87A = relief;
      baseTax = excessIncome;
    }
  }

  const cess = baseTax * yearConfig.cessRate;
  const totalTax = baseTax + cess;

  return {
    tax: Math.round(baseTax),
    cess: Math.round(cess),
    total: Math.round(totalTax),
    taxableIncome: taxable,
    rebate87A: Math.round(rebate87A),
    regime,
    assessmentYear: normalizedYear,
    financialYear: yearConfig.financialYear,
    statutoryAct: yearConfig.statutoryAct,
    standardDeduction: regimeConfig.standardDeduction
  };
}

/**
 * Advanced Tax Comparison & Recommendation Engine with Deductions
 */
export function calculateAdvancedTaxEngine({
  grossIncome = 0,
  sec80C = 0,
  sec80D = 0,
  hra = 0,
  homeLoan = 0,
  otherDeductions = 0,
  assessmentYear = DEFAULT_ASSESSMENT_YEAR
}) {
  const gross = Math.max(0, parseFloat(grossIncome) || 0);
  const c80 = Math.min(150000, Math.max(0, parseFloat(sec80C) || 0));
  const d80 = Math.max(0, parseFloat(sec80D) || 0);
  const hraExempt = Math.max(0, parseFloat(hra) || 0);
  const homeLoanInt = Math.min(200000, Math.max(0, parseFloat(homeLoan) || 0));
  const otherDed = Math.max(0, parseFloat(otherDeductions) || 0);

  const normalizedYear = TAX_YEAR_CONFIGS[assessmentYear] ? assessmentYear : DEFAULT_ASSESSMENT_YEAR;
  const yearConfig = TAX_YEAR_CONFIGS[normalizedYear];

  const oldStandardDeduction = yearConfig.oldRegime.standardDeduction;
  const newStandardDeduction = yearConfig.newRegime.standardDeduction;

  const totalOldDeductions = oldStandardDeduction + c80 + d80 + hraExempt + homeLoanInt + otherDed;
  const oldTaxable = Math.max(0, gross - totalOldDeductions);
  const newTaxable = Math.max(0, gross - newStandardDeduction);

  const oldResult = calculateTaxEngine(oldTaxable, "old", normalizedYear);
  const newResult = calculateTaxEngine(newTaxable, "new", normalizedYear);

  const taxDiff = oldResult.total - newResult.total;
  let recommendedRegime = "new";
  let savings = 0;

  if (taxDiff > 0) {
    recommendedRegime = "new";
    savings = taxDiff;
  } else if (taxDiff < 0) {
    recommendedRegime = "old";
    savings = Math.abs(taxDiff);
  } else {
    recommendedRegime = "new"; // Tie-breaker favors new regime with less compliance paperwork
    savings = 0;
  }

  return {
    grossIncome: gross,
    assessmentYear: normalizedYear,
    financialYear: yearConfig.financialYear,
    statutoryAct: yearConfig.statutoryAct,
    oldRegime: {
      ...oldResult,
      standardDeduction: oldStandardDeduction,
      totalDeductions: totalOldDeductions,
      netTaxable: oldTaxable
    },
    newRegime: {
      ...newResult,
      standardDeduction: newStandardDeduction,
      totalDeductions: newStandardDeduction,
      netTaxable: newTaxable
    },
    recommendedRegime,
    taxSavings: Math.round(savings)
  };
}

export default {
  calculateTaxEngine,
  calculateAdvancedTaxEngine,
  AVAILABLE_ASSESSMENT_YEARS,
  DEFAULT_ASSESSMENT_YEAR,
  TAX_YEAR_CONFIGS
};
