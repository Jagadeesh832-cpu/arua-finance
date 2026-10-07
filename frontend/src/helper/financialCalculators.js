/**
 * Arua Finance — Centralized Financial Calculation Engine
 * Indian Tax FY 2025-26, SIP, FD, PPF, Lumpsum, Emergency Cushion, and Health Score.
 */

/**
 * 1. Income Tax Calculation for FY 2025-26
 */
export const calculateTax = (income, regime = 'new') => {
  const taxable = Math.max(0, parseFloat(income) || 0);

  if (regime === 'new') {
    // New Tax Regime Slabs (FY 2025-26)
    // 0 - 3,00,000 : Nil
    // 3,00,001 - 6,00,000 : 5%
    // 6,00,001 - 9,00,000 : 10%
    // 9,00,001 - 12,00,000 : 15%
    // 12,00,001 - 15,00,000 : 20%
    // Above 15,00,000 : 30%
    let tax = 0;
    if (taxable <= 300000) {
      tax = 0;
    } else if (taxable <= 600000) {
      tax = (taxable - 300000) * 0.05;
    } else if (taxable <= 900000) {
      tax = 15000 + (taxable - 600000) * 0.10;
    } else if (taxable <= 1200000) {
      tax = 45000 + (taxable - 900000) * 0.15;
    } else if (taxable <= 1500000) {
      tax = 90000 + (taxable - 1200000) * 0.20;
    } else {
      tax = 150000 + (taxable - 1500000) * 0.30;
    }

    // Section 87A rebate for New Regime: Taxable income up to ₹7,00,000 pays 0 tax
    if (taxable <= 700000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    return {
      tax: Math.round(tax),
      cess: Math.round(cess),
      total: Math.round(tax + cess),
      taxableIncome: taxable
    };
  } else {
    // Old Tax Regime Slabs
    // 0 - 2,50,000 : Nil
    // 2,50,001 - 5,00,000 : 5%
    // 5,00,001 - 10,00,000 : 20%
    // Above 10,00,000 : 30%
    let tax = 0;
    if (taxable <= 250000) {
      tax = 0;
    } else if (taxable <= 500000) {
      tax = (taxable - 250000) * 0.05;
    } else if (taxable <= 1000000) {
      tax = 12500 + (taxable - 500000) * 0.20;
    } else {
      tax = 112500 + (taxable - 1000000) * 0.30;
    }

    // Section 87A rebate for Old Regime: Taxable income up to ₹5,00,000 pays 0 tax
    if (taxable <= 500000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    return {
      tax: Math.round(tax),
      cess: Math.round(cess),
      total: Math.round(tax + cess),
      taxableIncome: taxable
    };
  }
};

/**
 * 2. Advanced Tax Calculation with Deductions
 */
export const calculateAdvancedTax = ({
  grossIncome = 0,
  sec80C = 0,
  sec80D = 0,
  hra = 0,
  homeLoan = 0,
  otherDeductions = 0
}) => {
  const gross = Math.max(0, parseFloat(grossIncome) || 0);
  const c80 = Math.min(150000, Math.max(0, parseFloat(sec80C) || 0));
  const d80 = Math.max(0, parseFloat(sec80D) || 0);
  const hraExempt = Math.max(0, parseFloat(hra) || 0);
  const homeLoanInt = Math.min(200000, Math.max(0, parseFloat(homeLoan) || 0));
  const otherDed = Math.max(0, parseFloat(otherDeductions) || 0);

  const oldStandardDeduction = 50000;
  const newStandardDeduction = 75000;

  const totalOldDeductions = oldStandardDeduction + c80 + d80 + hraExempt + homeLoanInt + otherDed;
  const oldTaxableIncome = Math.max(0, gross - totalOldDeductions);
  const newTaxableIncome = Math.max(0, gross - newStandardDeduction);

  const oldTaxResult = calculateTax(oldTaxableIncome, 'old');
  const newTaxResult = calculateTax(newTaxableIncome, 'new');

  const savings = oldTaxResult.total - newTaxResult.total;
  const recommendedRegime = oldTaxResult.total < newTaxResult.total ? 'old' : 'new';

  return {
    grossIncome: gross,
    oldRegime: {
      grossIncome: gross,
      standardDeduction: oldStandardDeduction,
      sec80C: c80,
      sec80D: d80,
      hra: hraExempt,
      homeLoan: homeLoanInt,
      otherDeductions: otherDed,
      totalDeductions: totalOldDeductions,
      taxableIncome: oldTaxableIncome,
      tax: oldTaxResult.tax,
      cess: oldTaxResult.cess,
      total: oldTaxResult.total
    },
    newRegime: {
      grossIncome: gross,
      standardDeduction: newStandardDeduction,
      taxableIncome: newTaxableIncome,
      tax: newTaxResult.tax,
      cess: newTaxResult.cess,
      total: newTaxResult.total
    },
    savings,
    recommendedRegime
  };
};

/**
 * 3. HRA Exemption Calculator under Section 10(13A)
 */
export const calculateHRA = (basicSalary, hraReceived, rentPaid, isMetro = true) => {
  const basic = Math.max(0, parseFloat(basicSalary) || 0);
  const hra = Math.max(0, parseFloat(hraReceived) || 0);
  const rent = Math.max(0, parseFloat(rentPaid) || 0);

  const metroPercent = isMetro ? 0.50 : 0.40;
  const exemption1 = hra;
  const exemption2 = basic * metroPercent;
  const exemption3 = Math.max(0, rent - (basic * 0.10));

  const exemption = Math.round(Math.min(exemption1, exemption2, exemption3));
  const taxableHRA = Math.round(Math.max(0, hra - exemption));

  return { exemption, taxableHRA };
};

/**
 * 4. Advance Tax Instalment Schedule
 */
export const calculateAdvanceTax = (annualTax) => {
  const tax = Math.max(0, parseFloat(annualTax) || 0);
  const q1 = Math.round(tax * 0.15); // 15% by June 15
  const q2 = Math.round(tax * 0.45); // 45% by Sep 15
  const q3 = Math.round(tax * 0.75); // 75% by Dec 15
  const q4 = Math.round(tax * 1.00); // 100% by Mar 15

  return {
    q1: { amount: q1, dueDate: 'June 15' },
    q2: { amount: q2 - q1, dueDate: 'September 15' },
    q3: { amount: q3 - q2, dueDate: 'December 15' },
    q4: { amount: q4 - q3, dueDate: 'March 15' }
  };
};

/**
 * 5. Simple & Compound Interest Calculator
 */
export const calculateInterest = (principal, rate, time) => {
  const p = Math.max(0, parseFloat(principal) || 0);
  const r = Math.max(0, parseFloat(rate) || 0);
  const t = Math.max(0, parseFloat(time) || 0);

  const simpleInterest = Math.round((p * r * t) / 100);
  const compoundInterest = Math.round(p * Math.pow(1 + r / 100, t) - p);

  return {
    simpleInterest,
    compoundInterest,
    simpleTotal: Math.round(p + simpleInterest),
    compoundTotal: Math.round(p + compoundInterest)
  };
};

/**
 * 6. SIP Calculator with Step-up
 */
export const calculateSIP = (monthly, annualRate, years, stepUpPct = 0) => {
  const m = Math.max(0, parseFloat(monthly) || 0);
  const r = Math.max(0, parseFloat(annualRate) || 0);
  const y = Math.max(1, parseFloat(years) || 1);
  const step = Math.max(0, parseFloat(stepUpPct) || 0);

  const monthlyRate = r / 12 / 100;
  let totalInvested = 0;
  let totalValue = 0;
  let currentMonthly = m;

  for (let year = 1; year <= y; year++) {
    for (let month = 1; month <= 12; month++) {
      totalInvested += currentMonthly;
      totalValue = (totalValue + currentMonthly) * (1 + monthlyRate);
    }
    if (step > 0) {
      currentMonthly += currentMonthly * (step / 100);
    }
  }

  const returns = Math.round(totalValue - totalInvested);
  return {
    totalInvested: Math.round(totalInvested),
    returns: Math.max(0, returns),
    finalValue: Math.round(totalValue)
  };
};

/**
 * 7. Fixed Deposit (FD) Calculator
 */
export const calculateFD = (principal, annualRate, years, compPerYear = 4) => {
  const p = Math.max(0, parseFloat(principal) || 0);
  const r = Math.max(0, parseFloat(annualRate) || 0) / 100;
  const t = Math.max(0.1, parseFloat(years) || 1);
  const n = compPerYear || 4;

  const maturity = Math.round(p * Math.pow(1 + r / n, n * t));
  const interest = Math.max(0, maturity - p);

  return {
    principal: p,
    interestEarned: interest,
    maturityAmount: maturity
  };
};

/**
 * 8. Public Provident Fund (PPF) Calculator (15-yr statutory)
 */
export const calculatePPF = (annualDeposit, rate = 7.1, years = 15) => {
  const deposit = Math.min(150000, Math.max(0, parseFloat(annualDeposit) || 0));
  const r = (parseFloat(rate) || 7.1) / 100;
  const y = Math.max(1, parseInt(years, 10) || 15);
  let totalInvested = 0;
  let balance = 0;

  for (let year = 1; year <= y; year++) {
    totalInvested += deposit;
    balance = (balance + deposit) * (1 + r);
  }

  const interest = Math.round(balance - totalInvested);
  return {
    totalInvested: Math.round(totalInvested),
    interestEarned: Math.max(0, interest),
    maturityAmount: Math.round(balance)
  };
};

/**
 * 9. Lumpsum Equity Growth Calculator
 */
export const calculateLumpsum = (principal, cagr, years) => {
  const p = Math.max(0, parseFloat(principal) || 0);
  const r = Math.max(0, parseFloat(cagr) || 0) / 100;
  const t = Math.max(1, parseFloat(years) || 1);

  const maturity = Math.round(p * Math.pow(1 + r, t));
  const capitalGains = Math.max(0, maturity - p);

  return {
    invested: p,
    capitalGains,
    finalCorpus: maturity
  };
};

/**
 * 10. Emergency Fund Cushion Calculator
 */
export const calculateEmergencyFund = (monthlySpend, currentSavings) => {
  const spend = Math.max(0, parseFloat(monthlySpend) || 0);
  const savings = Math.max(0, parseFloat(currentSavings) || 0);

  const min3Months = Math.round(spend * 3);
  const rec6Months = Math.round(spend * 6);
  const max12Months = Math.round(spend * 12);

  const progressPct = rec6Months > 0 ? Math.min(100, Math.round((savings / rec6Months) * 100)) : 0;
  const shortfall = Math.max(0, rec6Months - savings);
  const monthlySavingsFor6Months = Math.round(shortfall / 6);
  const monthlySavingsFor12Months = Math.round(shortfall / 12);

  return {
    spend,
    savings,
    min3Months,
    rec6Months,
    max12Months,
    progressPct,
    shortfall,
    monthlySavingsFor6Months,
    monthlySavingsFor12Months,
    isFunded: savings >= rec6Months
  };
};
