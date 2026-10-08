/**
 * Arua Finance — Centralized Financial Calculation Engine
 * Indian Income Tax (AY 2025-26 & AY 2026-27), SIP, FD, PPF, Lumpsum, Emergency Cushion, and Health Score.
 */

import {
  calculateTaxEngine,
  calculateAdvancedTaxEngine,
  AVAILABLE_ASSESSMENT_YEARS,
  DEFAULT_ASSESSMENT_YEAR,
  TAX_YEAR_CONFIGS
} from './taxRules/index.js';

export {
  AVAILABLE_ASSESSMENT_YEARS,
  DEFAULT_ASSESSMENT_YEAR,
  TAX_YEAR_CONFIGS
};

/**
 * 1. Income Tax Calculation (Versioned Architecture)
 * Supports AY 2025-26 (Finance (No. 2) Act 2024), AY 2026-27, AY 2024-25.
 */
export const calculateTax = (income, regime = 'new', assessmentYear = DEFAULT_ASSESSMENT_YEAR) => {
  return calculateTaxEngine(income, regime, assessmentYear);
};

/**
 * 2. Advanced Tax Calculation with Deductions Comparison
 */
export const calculateAdvancedTax = (params) => {
  return calculateAdvancedTaxEngine(params);
};

/**
 * 3. HRA Exemption Calculator (Section 10(13A))
 */
export const calculateHRA = (basicSalary, hraReceived, rentPaid, isMetro = false) => {
  const basic = Math.max(0, parseFloat(basicSalary) || 0);
  const hra = Math.max(0, parseFloat(hraReceived) || 0);
  const rent = Math.max(0, parseFloat(rentPaid) || 0);

  const exemption1 = hra;
  const exemption2 = basic * (isMetro ? 0.50 : 0.40);
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
    estimatedReturns: Math.max(0, returns),
    finalValue: Math.round(totalValue),
    totalValue: Math.round(totalValue)
  };
};

/**
 * 7. Fixed Deposit (FD) Calculator (Quarterly Compounding default)
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
 * 8. Public Provident Fund (PPF) Calculator (Statutory Indian Scheme Modeling)
 * Compliant with Government of India Ministry of Finance statutory rules.
 * Compounded annually on March 31st with monthly accrual on 5th-day balance.
 */
export const calculatePPF = (depositAmount, rate = 7.1, years = 15, frequency = 'annual') => {
  const annualMax = 150000;
  const isMonthly = frequency === 'monthly';
  const r = (parseFloat(rate) || 7.1) / 100;
  const numYears = Math.max(1, parseInt(years, 10) || 15);

  let rawDeposit = Math.max(0, parseFloat(depositAmount) || 0);
  let annualDeposit = isMonthly ? Math.min(annualMax, rawDeposit * 12) : Math.min(annualMax, rawDeposit);
  let monthlyDeposit = isMonthly ? annualDeposit / 12 : 0;

  let balance = 0;
  let totalInvested = 0;
  const yearlySchedule = [];

  for (let yr = 1; yr <= numYears; yr++) {
    const openingBalance = balance;
    let yearInterest = 0;
    let yearDeposits = 0;

    if (isMonthly) {
      let runningBalance = openingBalance;
      for (let m = 1; m <= 12; m++) {
        runningBalance += monthlyDeposit;
        yearDeposits += monthlyDeposit;
        yearInterest += runningBalance * (r / 12);
      }
      balance = openingBalance + yearDeposits + yearInterest;
    } else {
      yearDeposits = annualDeposit;
      const eligibleBalance = openingBalance + yearDeposits;
      yearInterest = eligibleBalance * r;
      balance = eligibleBalance + yearInterest;
    }

    totalInvested += yearDeposits;
    yearlySchedule.push({
      year: yr,
      openingBalance: Math.round(openingBalance),
      deposit: Math.round(yearDeposits),
      interest: Math.round(yearInterest),
      closingBalance: Math.round(balance)
    });
  }

  const totalInterest = Math.max(0, balance - totalInvested);

  return {
    totalInvested: Math.round(totalInvested),
    invested: Math.round(totalInvested),
    principal: Math.round(totalInvested),
    interestEarned: Math.round(totalInterest),
    maturityAmount: Math.round(balance),
    finalValue: Math.round(balance),
    totalValue: Math.round(balance),
    maxLimitPerYear: annualMax,
    rate: Number((r * 100).toFixed(2)),
    years: numYears,
    frequency,
    statutoryRule: "Government of India PPF Scheme — Annually Compounded, Monthly 5th-day Minimum Balance Accrual",
    schedule: yearlySchedule,
    yearlySchedule
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
    principal: p,
    invested: p,
    capitalGains,
    maturityAmount: maturity,
    finalCorpus: maturity
  };
};

/**
 * 10. Emergency Fund Calculator
 */
export const calculateEmergencyFund = (monthlySpend, currentSavingsOrMonths = 6, dependentCount = 0) => {
  const spend = Math.max(0, parseFloat(monthlySpend) || 0);
  const isSavingsParam = parseFloat(currentSavingsOrMonths) > 24;
  const savings = isSavingsParam ? parseFloat(currentSavingsOrMonths) : 0;
  const m = isSavingsParam ? 6 : Math.max(3, parseInt(currentSavingsOrMonths, 10) || 6);
  const deps = Math.max(0, parseInt(dependentCount, 10) || 0);

  const min3Months = Math.round(spend * 3);
  const rec6Months = Math.round(spend * 6);
  const max12Months = Math.round(spend * 12);
  const adjustedMonths = m + Math.floor(deps / 2);
  const target = Math.round(spend * adjustedMonths);
  const progressPct = rec6Months > 0 ? Math.min(100, Math.round((savings / rec6Months) * 100)) : 0;
  const shortfall = Math.max(0, rec6Months - savings);

  return {
    spend,
    savings,
    min3Months,
    rec6Months,
    max12Months,
    progressPct,
    shortfall,
    targetAmount: target,
    baseAmount: Math.round(spend * m),
    bufferMonths: adjustedMonths,
    minimumComfort: min3Months,
    solidFortress: rec6Months,
    bulletproofSecurity: max12Months,
    isFunded: savings >= rec6Months
  };
};

/**
 * 11. Financial Health Score (0 - 100)
 */
export const calculateFinancialHealthScore = ({
  monthlyIncome = 0,
  monthlyExpenses = 0,
  emergencyFund = 0,
  totalDebt = 0,
  monthlyInvestments = 0
}) => {
  const income = Math.max(1, parseFloat(monthlyIncome) || 0);
  const expenses = Math.max(0, parseFloat(monthlyExpenses) || 0);
  const eFund = Math.max(0, parseFloat(emergencyFund) || 0);
  const debt = Math.max(0, parseFloat(totalDebt) || 0);
  const investments = Math.max(0, parseFloat(monthlyInvestments) || 0);

  // Pillar 1: Savings Rate (30 pts max)
  const savingsRate = Math.max(0, (income - expenses) / income);
  const savingsScore = Math.min(30, Math.round(savingsRate * 60));

  // Pillar 2: Emergency Cushion (25 pts max)
  const monthlyExp = expenses || (income * 0.5);
  const eMonths = eFund / Math.max(1, monthlyExp);
  const eFundScore = Math.min(25, Math.round((eMonths / 6) * 25));

  // Pillar 3: Debt-to-Income (25 pts max)
  const annualIncome = income * 12;
  const debtRatio = debt / annualIncome;
  let debtScore = 25;
  if (debtRatio > 1.5) debtScore = 0;
  else if (debtRatio > 1.0) debtScore = 8;
  else if (debtRatio > 0.5) debtScore = 16;
  else debtScore = 25;

  // Pillar 4: Investment Consistency (20 pts max)
  const investRate = investments / income;
  const investScore = Math.min(20, Math.round(investRate * 100));

  const totalScore = Math.min(100, Math.max(0, savingsScore + eFundScore + debtScore + investScore));

  let tier = 'Needs Focus';
  let badgeColor = 'rose';
  if (totalScore >= 80) {
    tier = 'Financial Fortress';
    badgeColor = 'emerald';
  } else if (totalScore >= 65) {
    tier = 'Financially Strong';
    badgeColor = 'blue';
  } else if (totalScore >= 50) {
    tier = 'Moderate Resilience';
    badgeColor = 'amber';
  }

  return {
    score: totalScore,
    tier,
    badgeColor,
    breakdown: {
      savingsScore,
      emergencyFundScore: eFundScore,
      debtScore,
      investmentScore: investScore
    }
  };
};

export default {
  calculateTax,
  calculateAdvancedTax,
  calculateHRA,
  calculateAdvanceTax,
  calculateInterest,
  calculateSIP,
  calculateFD,
  calculatePPF,
  calculateLumpsum,
  calculateEmergencyFund,
  calculateFinancialHealthScore,
  AVAILABLE_ASSESSMENT_YEARS,
  DEFAULT_ASSESSMENT_YEAR,
  TAX_YEAR_CONFIGS
};
