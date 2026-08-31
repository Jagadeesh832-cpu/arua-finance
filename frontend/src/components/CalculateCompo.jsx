import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  BarChart3,
  GitCompare,
  PieChart,
  Settings,
  RotateCcw,
  BookOpen,
  FileText,
  Building,
  CreditCard,
  TrendingUp,
  FileCheck,
  Heart,
  Download,
  Info,
  IndianRupee,
  ReceiptText,
  Calendar,
  Users,
  Target,
  Zap,
  Shield,
  Award,
  CheckCircle,
  ArrowRight,
  Home,
  Percent,
  TrendingDown,
  AlertCircle,
  Clock,
  Star,
  Plus,
  Minus,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Sparkles
} from 'lucide-react';
import Navbar from './Navbar';
import { useAuth } from '../helper/auth';

// Tax calculation logic based on Indian tax slabs for FY 2025-26
const calculateTax = (income, regime) => {
  const taxable = Math.max(0, parseFloat(income) || 0);

  if (regime === 'new') {
    // New Tax Regime Slabs (FY 2025-26)
    let tax = 0;
    if (taxable <= 300000) tax = 0;
    else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
    else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.10;
    else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15;
    else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.20;
    else tax = 150000 + (taxable - 1500000) * 0.30;

    // Section 87A rebate for New Regime: Income up to ₹7,00,000 pays 0 tax
    if (taxable <= 700000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    return { tax, cess, total: tax + cess, taxableIncome: taxable };
  } else {
    // Old Tax Regime Slabs
    let tax = 0;
    if (taxable <= 250000) tax = 0;
    else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
    else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
    else tax = 112500 + (taxable - 1000000) * 0.30;

    // Section 87A rebate for Old Regime: Income up to ₹5,00,000 pays 0 tax
    if (taxable <= 500000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    return { tax, cess, total: tax + cess, taxableIncome: taxable };
  }
};

// Advanced Tax Calculation with Deductions
const calculateAdvancedTax = ({
  grossIncome,
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


// HRA Calculation
const calculateHRA = (basicSalary, hraReceived, rentPaid, isMetro) => {
  const metroPercent = isMetro ? 0.5 : 0.4;
  const exemption1 = hraReceived;
  const exemption2 = basicSalary * metroPercent;
  const exemption3 = rentPaid - (basicSalary * 0.1);

  const exemption = Math.min(exemption1, exemption2, Math.max(0, exemption3));
  const taxableHRA = hraReceived - exemption;

  return { exemption, taxableHRA };
};

// Advance Tax Calculation
const calculateAdvanceTax = (annualTax) => {
  const q1 = annualTax * 0.15; // 15% by June 15
  const q2 = annualTax * 0.45; // 45% by Sep 15
  const q3 = annualTax * 0.75; // 75% by Dec 15
  const q4 = annualTax * 1.0;  // 100% by Mar 15

  return {
    q1: { amount: q1, dueDate: 'June 15' },
    q2: { amount: q2 - q1, dueDate: 'September 15' },
    q3: { amount: q3 - q2, dueDate: 'December 15' },
    q4: { amount: q4 - q3, dueDate: 'March 15' }
  };
};

// Interest Calculation
const calculateInterest = (principal, rate, time) => {
  const simpleInterest = (principal * rate * time) / 100;
  const compoundInterest = principal * Math.pow((1 + rate / 100), time) - principal;
  return { simpleInterest, compoundInterest };
};



function Navigation({ activeTab, setActiveTab }) {
  const mainTabs = [
    { id: 'calculator', label: 'Tax Studio', icon: ReceiptText },
    { id: 'results', label: 'Tax Results', icon: FileText },
    { id: 'comparison', label: 'Comparison', icon: GitCompare },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'features', label: 'Features', icon: Settings },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'changelog', label: 'Changelog', icon: RotateCcw }
  ];

  const subTabs = [
    { id: 'regime-guide', label: 'Regime Guide', icon: BookOpen },
    { id: 'tax-slabs', label: 'Tax Slabs', icon: BarChart3 },
    { id: 'hra-calculator', label: 'HRA Calculator', icon: Building },
    { id: 'advance-tax', label: 'Advance Tax', icon: CreditCard },
    { id: 'interest', label: 'Interest', icon: TrendingUp },
    { id: 'itr-form', label: 'ITR Form', icon: FileCheck }
  ];

  return (
    <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-3 sm:p-4 shadow-xl shadow-black/20 space-y-3">
      {/* Primary Studio Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            Studio Workspaces
          </span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'text-white gradient-bg shadow-md shadow-blue-500/25 border border-blue-400/40'
                    : 'text-slate-400 bg-slate-900/60 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Tools & Calculators Bar */}
      <div className="pt-2.5 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calculator className="w-3 h-3 text-emerald-400" />
            Tax Calculators & Guides
          </span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'text-cyan-300 bg-blue-950/80 border border-blue-500/50 shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 bg-slate-900/40 hover:text-slate-200 hover:bg-slate-900/80 border border-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TaxCalculator({ onSaveResult }) {
  const { LoggedInUserData } = useAuth();
  const [calculatorType, setCalculatorType] = useState('simple');

  // Simple State
  const [income, setIncome] = useState('1200000');
  const [simpleResults, setSimpleResults] = useState(() => {
    const oldR = calculateTax(1200000, 'old');
    const newR = calculateTax(1200000, 'new');
    return {
      income: 1200000,
      oldRegime: oldR,
      newRegime: newR,
      savings: oldR.total - newR.total,
      recommendedRegime: oldR.total < newR.total ? 'old' : 'new'
    };
  });

  // Advanced State
  const [advancedInputs, setAdvancedInputs] = useState({
    grossIncome: '1500000',
    sec80C: '150000',
    sec80D: '25000',
    hra: '120000',
    homeLoan: '50000',
    otherDeductions: '0'
  });
  const [advancedResults, setAdvancedResults] = useState(() => {
    return calculateAdvancedTax({
      grossIncome: '1500000',
      sec80C: '150000',
      sec80D: '25000',
      hra: '120000',
      homeLoan: '50000',
      otherDeductions: '0'
    });
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (LoggedInUserData?.annualIncome) {
      const inc = String(LoggedInUserData.annualIncome);
      setIncome(inc);
      setAdvancedInputs((prev) => ({
        ...prev,
        grossIncome: inc
      }));
      // Auto compute initial
      const num = parseFloat(inc);
      if (num > 0) {
        const oldR = calculateTax(num, 'old');
        const newR = calculateTax(num, 'new');
        setSimpleResults({
          income: num,
          oldRegime: oldR,
          newRegime: newR,
          savings: oldR.total - newR.total,
          recommendedRegime: oldR.total < newR.total ? 'old' : 'new'
        });
      }
    }
  }, [LoggedInUserData]);

  const handleSimpleCalculate = (customVal) => {
    setErrorMsg('');
    const val = customVal !== undefined ? customVal : income;
    const annualIncome = parseFloat(val);
    if (isNaN(annualIncome) || annualIncome < 0) {
      setErrorMsg('Please enter a valid positive annual income amount.');
      setSimpleResults(null);
      return;
    }

    const oldRegime = calculateTax(annualIncome, 'old');
    const newRegime = calculateTax(annualIncome, 'new');
    const savings = oldRegime.total - newRegime.total;
    const recommendedRegime = oldRegime.total < newRegime.total ? 'old' : 'new';

    const res = {
      income: annualIncome,
      oldRegime,
      newRegime,
      savings,
      recommendedRegime
    };

    setSimpleResults(res);
    if (onSaveResult) onSaveResult(res);
  };

  const handleAdvancedCalculate = (customInputs) => {
    setErrorMsg('');
    const inputs = customInputs || advancedInputs;
    const gross = parseFloat(inputs.grossIncome);
    if (isNaN(gross) || gross < 0) {
      setErrorMsg('Please enter a valid gross annual salary.');
      setAdvancedResults(null);
      return;
    }

    const res = calculateAdvancedTax(inputs);
    setAdvancedResults(res);
    if (onSaveResult) {
      onSaveResult({
        income: res.grossIncome,
        oldRegime: res.oldRegime,
        newRegime: res.newRegime,
        savings: res.savings,
        recommendedRegime: res.recommendedRegime
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-cyan-300 text-xs font-bold mb-2">
          <ReceiptText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Indian Tax Slabs • Budget FY 2025-26</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2.5">
          <span>Tax Studio & Regime Optimizer</span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
            ₹ Slabs
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          Compare total tax liability under the Old vs New Tax Regime with automated deductions, 87A rebate, and optimal savings intelligence.
        </p>
      </motion.div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="flex bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setCalculatorType('simple')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              calculatorType === 'simple'
                ? 'gradient-bg text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simple Calculator</span>
          </button>
          <button
            onClick={() => setCalculatorType('advanced')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              calculatorType === 'advanced'
                ? 'gradient-bg text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Calculator (Deductions)</span>
          </button>
        </div>
      </div>

      {/* ================= SIMPLE CALCULATOR ================= */}
      {calculatorType === 'simple' && (
        <motion.div
          key="simple"
          className="max-w-2xl mx-auto space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quick Tax Estimator</h3>
                <p className="text-xs text-slate-400">Direct taxable income calculation across both regimes</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Total Annual Income (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => {
                      setIncome(e.target.value);
                      handleSimpleCalculate(e.target.value);
                    }}
                    placeholder="e.g. 1200000"
                    className="w-full pl-9 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-base font-semibold"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={() => handleSimpleCalculate()}
                className="w-full gradient-bg text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 border border-blue-400/30"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Calculate & Compare Regimes</span>
              </button>
            </div>
          </div>

          {/* Simple Results Breakdown */}
          {simpleResults && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {/* Old Regime Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      Old Tax Regime
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Standard
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Annual Income:</span>
                      <span className="font-semibold text-white">₹{simpleResults.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Basic Tax:</span>
                      <span className="font-semibold text-white">₹{simpleResults.oldRegime.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Health & Edu Cess (4%):</span>
                      <span className="font-semibold text-white">₹{simpleResults.oldRegime.cess.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2.5 mt-2 flex justify-between items-center">
                      <span className="font-bold text-white text-sm">Total Tax Payable:</span>
                      <span className="font-black text-rose-400 text-lg">₹{simpleResults.oldRegime.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* New Regime Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      New Tax Regime
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      FY 25–26
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Annual Income:</span>
                      <span className="font-semibold text-white">₹{simpleResults.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Basic Tax:</span>
                      <span className="font-semibold text-white">₹{simpleResults.newRegime.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Health & Edu Cess (4%):</span>
                      <span className="font-semibold text-white">₹{simpleResults.newRegime.cess.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2.5 mt-2 flex justify-between items-center">
                      <span className="font-bold text-white text-sm">Total Tax Payable:</span>
                      <span className="font-black text-emerald-400 text-lg">₹{simpleResults.newRegime.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-purple-950/80 rounded-2xl p-5 border border-blue-500/30 text-center space-y-2 shadow-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Recommendation: {simpleResults.recommendedRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {simpleResults.savings > 0 ? (
                    <>You will save <strong className="text-emerald-400 font-extrabold">₹{Math.abs(simpleResults.savings).toLocaleString()}</strong> by opting for the New Tax Regime.</>
                  ) : simpleResults.savings < 0 ? (
                    <>You will save <strong className="text-emerald-400 font-extrabold">₹{Math.abs(simpleResults.savings).toLocaleString()}</strong> by opting for the Old Tax Regime.</>
                  ) : (
                    <>Both regimes result in the exact same tax liability.</>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ================= ADVANCED CALCULATOR ================= */}
      {calculatorType === 'advanced' && (
        <motion.div
          key="advanced"
          className="max-w-4xl mx-auto space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Advanced Tax & Deduction Calibration</h3>
                <p className="text-xs text-slate-400">Include Section 80C, 80D, HRA, and Home Loan deductions to optimize tax liability</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Gross Income */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Gross Annual Salary / Total Income (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={advancedInputs.grossIncome}
                    onChange={(e) => setAdvancedInputs({ ...advancedInputs, grossIncome: e.target.value })}
                    placeholder="e.g. 1500000"
                    className="w-full pl-9 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-base font-semibold"
                  />
                </div>
              </div>

              {/* Section 80C */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Section 80C (PPF, EPF, ELSS, LIC)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={advancedInputs.sec80C}
                    onChange={(e) => setAdvancedInputs({ ...advancedInputs, sec80C: e.target.value })}
                    placeholder="Max ₹1,50,000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 outline-none text-sm font-semibold"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Maximum deduction capped at ₹1.5 Lakhs</span>
              </div>

              {/* Section 80D */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Section 80D (Health Insurance Premium)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={advancedInputs.sec80D}
                    onChange={(e) => setAdvancedInputs({ ...advancedInputs, sec80D: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 outline-none text-sm font-semibold"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Self, family & parents health cover</span>
              </div>

              {/* HRA Exemption */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  HRA Exemption Claimed (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={advancedInputs.hra}
                    onChange={(e) => setAdvancedInputs({ ...advancedInputs, hra: e.target.value })}
                    placeholder="e.g. 180000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 outline-none text-sm font-semibold"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Exemption based on rent paid (Old regime)</span>
              </div>

              {/* Home Loan Interest */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Section 24 (Home Loan Interest)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={advancedInputs.homeLoan}
                    onChange={(e) => setAdvancedInputs({ ...advancedInputs, homeLoan: e.target.value })}
                    placeholder="Max ₹2,00,000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 outline-none text-sm font-semibold"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Interest on self-occupied housing loan</span>
              </div>

              {/* Other Deductions */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Other Deductions (80CCD NPS, 80E Education Loan, 80G, etc.)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={advancedInputs.otherDeductions}
                    onChange={(e) => setAdvancedInputs({ ...advancedInputs, otherDeductions: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 outline-none text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAdvancedCalculate}
              className="w-full gradient-bg text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 border border-blue-400/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Compute Comprehensive Tax Breakdown</span>
            </button>
          </div>

          {/* Advanced Results */}
          {advancedResults && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {/* Detailed Old Regime Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      Old Tax Regime (With Deductions)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Standard: ₹50k
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Gross Salary:</span>
                      <span className="font-semibold text-white">₹{advancedResults.oldRegime.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Standard Deduction:</span>
                      <span className="font-semibold text-emerald-400">-₹{advancedResults.oldRegime.standardDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>80C + 80D + HRA + 24(b):</span>
                      <span className="font-semibold text-emerald-400">
                        -₹{(advancedResults.oldRegime.totalDeductions - advancedResults.oldRegime.standardDeduction).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800/80 pt-1.5">
                      <span>Net Taxable Income:</span>
                      <span className="text-cyan-300 font-mono">₹{advancedResults.oldRegime.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1">
                      <span>Income Tax:</span>
                      <span className="font-semibold text-white">₹{advancedResults.oldRegime.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Health & Edu Cess (4%):</span>
                      <span className="font-semibold text-white">₹{advancedResults.oldRegime.cess.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
                      <span className="font-bold text-white text-sm">Total Tax Payable:</span>
                      <span className="font-black text-rose-400 text-lg">₹{advancedResults.oldRegime.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed New Regime Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      New Tax Regime (FY 2025-26)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Standard: ₹75k
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Gross Salary:</span>
                      <span className="font-semibold text-white">₹{advancedResults.newRegime.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Standard Deduction:</span>
                      <span className="font-semibold text-emerald-400">-₹{advancedResults.newRegime.standardDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Other Exemptions:</span>
                      <span className="text-slate-500 italic">Nil (Simplified)</span>
                    </div>
                    <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800/80 pt-1.5">
                      <span>Net Taxable Income:</span>
                      <span className="text-cyan-300 font-mono">₹{advancedResults.newRegime.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1">
                      <span>Income Tax:</span>
                      <span className="font-semibold text-white">₹{advancedResults.newRegime.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Health & Edu Cess (4%):</span>
                      <span className="font-semibold text-white">₹{advancedResults.newRegime.cess.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
                      <span className="font-bold text-white text-sm">Total Tax Payable:</span>
                      <span className="font-black text-emerald-400 text-lg">₹{advancedResults.newRegime.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-purple-950/80 rounded-2xl p-5 border border-blue-500/30 text-center space-y-2 shadow-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Recommendation: {advancedResults.recommendedRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {advancedResults.savings > 0 ? (
                    <>You will save <strong className="text-emerald-400 font-extrabold">₹{Math.abs(advancedResults.savings).toLocaleString()}</strong> by opting for the New Tax Regime.</>
                  ) : advancedResults.savings < 0 ? (
                    <>You will save <strong className="text-emerald-400 font-extrabold">₹{Math.abs(advancedResults.savings).toLocaleString()}</strong> by opting for the Old Tax Regime due to high deductions.</>
                  ) : (
                    <>Both regimes result in the exact same tax liability.</>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function TaxResults() {
  const [savedResults] = useState([
    {
      id: 1,
      date: '2025-01-15',
      income: 1200000,
      oldRegime: { total: 112500 },
      newRegime: { total: 90000 },
      savings: 22500,
      recommendedRegime: 'new'
    },
    {
      id: 2,
      date: '2025-01-10',
      income: 800000,
      oldRegime: { total: 72500 },
      newRegime: { total: 45000 },
      savings: 27500,
      recommendedRegime: 'new'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Tax Results History</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Review saved regime comparisons and calculations</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {savedResults.map((result) => (
          <motion.div
            key={result.id}
            className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Annual Income: <span className="text-cyan-300">₹{result.income.toLocaleString()}</span>
                </h3>
                <p className="text-xs text-slate-400">Calculated on {result.date}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Award className="w-3.5 h-3.5 mr-1" />
                Best: {result.recommendedRegime === 'new' ? 'New Regime' : 'Old Regime'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Old Regime</p>
                <p className="text-base font-black text-rose-400 mt-1">₹{result.oldRegime.total.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase">New Regime</p>
                <p className="text-base font-black text-emerald-400 mt-1">₹{result.newRegime.total.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Net Savings</p>
                <p className="text-base font-black text-cyan-400 mt-1">₹{result.savings.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Comparison() {
  const [income1, setIncome1] = useState('800000');
  const [income2, setIncome2] = useState('1500000');
  const [comparisonResults, setComparisonResults] = useState(null);

  const handleCompare = () => {
    const amount1 = parseFloat(income1);
    const amount2 = parseFloat(income2);

    if (isNaN(amount1) || isNaN(amount2)) {
      alert('Please enter valid income amounts for both scenarios.');
      return;
    }

    const scenario1Old = calculateTax(amount1, 'old');
    const scenario1New = calculateTax(amount1, 'new');
    const scenario2Old = calculateTax(amount2, 'old');
    const scenario2New = calculateTax(amount2, 'new');

    setComparisonResults({
      scenario1: { income: amount1, old: scenario1Old, new: scenario1New },
      scenario2: { income: amount2, old: scenario2Old, new: scenario2New }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Multi-Income Scenario Comparison</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Compare tax brackets and savings across salary changes or promotions</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Scenario 1 Income (₹)</label>
              <input
                type="number"
                value={income1}
                onChange={(e) => setIncome1(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
                placeholder="e.g. 800000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Scenario 2 Income (₹)</label>
              <input
                type="number"
                value={income2}
                onChange={(e) => setIncome2(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
                placeholder="e.g. 1500000"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            className="w-full gradient-bg text-white py-3 px-6 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all border border-blue-400/30 flex items-center justify-center space-x-2"
          >
            <GitCompare className="w-4 h-4 text-cyan-300" />
            <span>Compare Both Scenarios</span>
          </button>
        </div>

        {comparisonResults && (
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Scenario 1 */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-base font-bold text-white mb-3">
                Scenario 1: <span className="text-cyan-300">₹{comparisonResults.scenario1.income.toLocaleString()}</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Old Regime Tax:</span>
                  <span className="font-semibold text-rose-400">₹{comparisonResults.scenario1.old.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>New Regime Tax:</span>
                  <span className="font-semibold text-emerald-400">₹{comparisonResults.scenario1.new.total.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">Difference / Savings:</span>
                  <span className="text-cyan-300">
                    ₹{Math.abs(comparisonResults.scenario1.old.total - comparisonResults.scenario1.new.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-base font-bold text-white mb-3">
                Scenario 2: <span className="text-cyan-300">₹{comparisonResults.scenario2.income.toLocaleString()}</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Old Regime Tax:</span>
                  <span className="font-semibold text-rose-400">₹{comparisonResults.scenario2.old.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>New Regime Tax:</span>
                  <span className="font-semibold text-emerald-400">₹{comparisonResults.scenario2.new.total.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">Difference / Savings:</span>
                  <span className="text-cyan-300">
                    ₹{Math.abs(comparisonResults.scenario2.old.total - comparisonResults.scenario2.new.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Analytics() {
  const analyticsData = [
    { income: 300000, oldTax: 0, newTax: 0 },
    { income: 500000, oldTax: 12500, newTax: 0 },
    { income: 800000, oldTax: 72500, newTax: 35000 },
    { income: 1200000, oldTax: 112500, newTax: 90000 },
    { income: 1500000, oldTax: 202500, newTax: 150000 },
    { income: 2000000, oldTax: 352500, newTax: 300000 }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Tax Slab Analytics</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Visual tax trajectory comparing Old vs New tax brackets across incomes</p>
      </div>

      <div className="max-w-4xl mx-auto bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
            <span>ANNUAL INCOME (₹)</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Old Regime</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> New Regime</span>
            </div>
          </div>

          <div className="space-y-3">
            {analyticsData.map((data, index) => (
              <div key={index} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-white">
                  <span>₹{data.income.toLocaleString()}</span>
                  <span className="text-slate-400 font-mono">Old: ₹{data.oldTax.toLocaleString()} | New: ₹{data.newTax.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(100, (data.oldTax / 400000) * 100)}%` }} />
                  </div>
                  <div className="bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, (data.newTax / 400000) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RegimeGuide() {
  const oldRegimeFeatures = [
    "Standard deduction of ₹50,000 for salaried employees",
    "Section 80C deductions up to ₹1,50,000 (PPF, ELSS, EPF)",
    "HRA exemption for house rent paid",
    "Section 80D medical insurance deduction (up to ₹75,000)",
    "Section 24(b) home loan interest deduction up to ₹2,00,000",
    "Section 80CCD(1B) NPS additional ₹50,000 deduction"
  ];

  const newRegimeFeatures = [
    "Enhanced tax-free limit up to ₹3,00,000",
    "Standard deduction increased to ₹75,000 in FY 2025-26",
    "Section 87A full tax rebate up to ₹7,00,000 taxable income",
    "Streamlined, lower tax rates across all middle brackets",
    "Zero hassle of tracking receipts and investment proofs",
    "Default tax regime for all salaried taxpayers"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Tax Regime Decision Guide</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Understand the fundamental differences and choose the optimal tax framework</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            Old Tax Regime
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            {oldRegimeFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300">
            <strong>Ideal For:</strong> Individuals claiming total deductions exceeding ₹3.75 Lakhs (HRA + 80C + Home Loan).
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            New Tax Regime (FY 25–26)
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            {newRegimeFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
            <strong>Ideal For:</strong> Salaried professionals with modest deductions and those seeking simplified filing with lower slab rates.
          </div>
        </div>
      </div>
    </div>
  );
}

function TaxSlabs() {
  const oldRegimeSlabs = [
    { range: "Up to ₹2,50,000", rate: "0%", tax: "Nil" },
    { range: "₹2,50,001 - ₹5,00,000", rate: "5%", tax: "₹12,500" },
    { range: "₹5,00,001 - ₹10,00,000", rate: "20%", tax: "₹1,12,500" },
    { range: "Above ₹10,00,000", rate: "30%", tax: "30% of excess" }
  ];

  const newRegimeSlabs = [
    { range: "Up to ₹3,00,000", rate: "0%", tax: "Nil" },
    { range: "₹3,00,001 - ₹6,00,000", rate: "5%", tax: "₹15,000" },
    { range: "₹6,00,001 - ₹9,00,000", rate: "10%", tax: "₹45,000" },
    { range: "₹9,00,001 - ₹12,00,000", rate: "15%", tax: "₹90,000" },
    { range: "₹12,00,001 - ₹15,00,000", rate: "20%", tax: "₹1,50,000" },
    { range: "Above ₹15,00,000", rate: "30%", tax: "30% of excess" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Income Tax Slabs FY 2025-26</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Official Indian income tax slab rates and cess percentages</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Old Slabs */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            Old Tax Regime Slabs
          </h3>
          <div className="space-y-2">
            {oldRegimeSlabs.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs">
                <span className="font-semibold text-white">{s.range}</span>
                <span className="font-bold text-rose-400 font-mono">{s.rate} ({s.tax})</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Slabs */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            New Tax Regime Slabs (FY 2025-26)
          </h3>
          <div className="space-y-2">
            {newRegimeSlabs.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs">
                <span className="font-semibold text-white">{s.range}</span>
                <span className="font-bold text-emerald-400 font-mono">{s.rate} ({s.tax})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HRACalculator() {
  const [basicSalary, setBasicSalary] = useState('600000');
  const [hraReceived, setHraReceived] = useState('240000');
  const [rentPaid, setRentPaid] = useState('180000');
  const [isMetro, setIsMetro] = useState(true);
  const [hraResults, setHraResults] = useState(null);

  const handleHRACalculate = () => {
    const basic = parseFloat(basicSalary);
    const hra = parseFloat(hraReceived);
    const rent = parseFloat(rentPaid);

    if (isNaN(basic) || isNaN(hra) || isNaN(rent)) {
      alert('Please enter valid numerical amounts.');
      return;
    }

    const results = calculateHRA(basic, hra, rent, isMetro);
    setHraResults(results);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">HRA Exemption Calculator</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Compute your legally eligible House Rent Allowance tax exemption under Section 10(13A)</p>
      </div>

      <div className="max-w-2xl mx-auto bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Annual Basic Salary (₹)</label>
          <input
            type="number"
            value={basicSalary}
            onChange={(e) => setBasicSalary(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Annual HRA Received (₹)</label>
          <input
            type="number"
            value={hraReceived}
            onChange={(e) => setHraReceived(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Annual Rent Paid (₹)</label>
          <input
            type="number"
            value={rentPaid}
            onChange={(e) => setRentPaid(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">City Location</label>
          <div className="flex space-x-4 text-xs font-semibold text-white">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" checked={isMetro} onChange={() => setIsMetro(true)} className="accent-blue-500" />
              <span>Metro (50% of Basic - Delhi, Mumbai, Kolkata, Chennai)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" checked={!isMetro} onChange={() => setIsMetro(false)} className="accent-blue-500" />
              <span>Non-Metro (40% of Basic)</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleHRACalculate}
          className="w-full gradient-bg text-white py-3 px-6 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-[1.01] transition-all border border-blue-400/30"
        >
          Calculate HRA Exemption
        </button>

        {hraResults && (
          <motion.div
            className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase">HRA Exemption</p>
              <p className="text-lg font-black text-emerald-400 mt-1">₹{hraResults.exemption.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Taxable HRA</p>
              <p className="text-lg font-black text-rose-400 mt-1">₹{hraResults.taxableHRA.toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AdvanceTaxCalculator() {
  const [annualTax, setAnnualTax] = useState('80000');
  const [advanceTaxResults, setAdvanceTaxResults] = useState(null);

  const handleAdvanceTaxCalculate = () => {
    const tax = parseFloat(annualTax);
    if (isNaN(tax) || tax < 0) {
      alert('Please enter a valid tax liability.');
      return;
    }
    const results = calculateAdvanceTax(tax);
    setAdvanceTaxResults(results);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Advance Tax Schedule</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Quarterly advance tax instalment breakdown & statutory deadlines</p>
      </div>

      <div className="max-w-2xl mx-auto bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Estimated Annual Tax Liability (₹)</label>
          <input
            type="number"
            value={annualTax}
            onChange={(e) => setAnnualTax(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
          />
        </div>

        <button
          onClick={handleAdvanceTaxCalculate}
          className="w-full gradient-bg text-white py-3 px-6 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-[1.01] transition-all border border-blue-400/30"
        >
          Compute Advance Tax Quarters
        </button>

        {advanceTaxResults && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {Object.entries(advanceTaxResults).map(([quarter, data]) => (
              <div key={quarter} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-left">
                <div className="text-[11px] font-bold text-cyan-400 uppercase">Q{quarter.slice(-1)} • Due: {data.dueDate}</div>
                <div className="text-base font-black text-emerald-400 mt-1">₹{Math.round(data.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InterestCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('8.5');
  const [time, setTime] = useState('3');
  const [interestResults, setInterestResults] = useState(null);

  const handleInterestCalculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);

    if (isNaN(p) || isNaN(r) || isNaN(t)) {
      alert('Please enter valid numeric values for principal, rate, and time.');
      return;
    }

    const results = calculateInterest(p, r, t);
    setInterestResults(results);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Interest Calculator</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Simple vs compound interest return estimator on fixed deposits and debt instruments</p>
      </div>

      <div className="max-w-2xl mx-auto bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Principal Deposit (₹)</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Interest Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Duration (Years)</label>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-cyan-400 text-sm font-semibold"
            />
          </div>
        </div>

        <button
          onClick={handleInterestCalculate}
          className="w-full gradient-bg text-white py-3 px-6 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-[1.01] transition-all border border-blue-400/30"
        >
          Compute Interest
        </button>

        {interestResults && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Simple Interest</p>
              <p className="text-lg font-black text-cyan-400 mt-1">₹{Math.round(interestResults.simpleInterest).toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Total: ₹{(parseFloat(principal) + interestResults.simpleInterest).toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Compound Interest</p>
              <p className="text-lg font-black text-emerald-400 mt-1">₹{Math.round(interestResults.compoundInterest).toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Total: ₹{(parseFloat(principal) + interestResults.compoundInterest).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ITRForm() {
  const itrForms = [
    {
      form: 'ITR-1 (Sahaj)',
      applicability: 'Resident individuals with salary, 1 house property, and interest income up to ₹50 Lakhs.',
      tag: 'Salaried'
    },
    {
      form: 'ITR-2',
      applicability: 'Individuals and HUFs with Capital Gains, crypto assets, foreign income, or multiple properties.',
      tag: 'Capital Gains'
    },
    {
      form: 'ITR-3',
      applicability: 'Individuals and HUFs having income from a proprietary business or profession.',
      tag: 'Business'
    },
    {
      form: 'ITR-4 (Sugam)',
      applicability: 'Small business owners and freelance professionals opting for Presumptive Taxation (Sec 44AD/44ADA).',
      tag: 'Presumptive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Income Tax Return (ITR) Form Selector</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Identify which Income Tax Return form applies to your income sources</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {itrForms.map((f, i) => (
          <div key={i} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">{f.form}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-cyan-300 border border-cyan-500/30">
                {f.tag}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{f.applicability}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    { icon: Calculator, title: "Tax Calculator", desc: "Interactive Old vs New regime comparator with slab analytics" },
    { icon: Building, title: "HRA Exemption", desc: "Instant Section 10(13A) metro/non-metro deduction tool" },
    { icon: CreditCard, title: "Advance Tax", desc: "Quarterly liability planning and compliance schedule" },
    { icon: BarChart3, title: "Slab Breakdown", desc: "Clear side-by-side tax rate progression" },
    { icon: GitCompare, title: "Scenario Testing", desc: "Dual salary comparison to assess promotion impact" },
    { icon: TrendingUp, title: "Interest Studio", desc: "Fixed return compounding on deposits and investments" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Tax Studio Features</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Full suite of automated taxation tools for Indian investors</p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-blue-500/20">
              <f.icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">{f.title}</h3>
            <p className="text-xs text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Resources() {
  const resources = [
    { title: "Income Tax Act 1961", desc: "Official Indian Income Tax provisions & sections" },
    { title: "Section 80C Deductions", desc: "ELSS, PPF, EPF, and NPS maximum tax efficiency guide" },
    { title: "HRA Rent Receipts Guide", desc: "Compliance checklist for rent receipts & landlord PAN" },
    { title: "Form 16 Reconciliation", desc: "Reconciling Part A & Part B TDS certificates" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Tax Resources & Reference</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Comprehensive guides on Indian taxation and compliance</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {resources.map((r, i) => (
          <div key={i} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>{r.title}</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Changelog() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Tax Studio Changelog</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Version update history and enhancements</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Version 2.5.0</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300">Latest</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Updated New Tax Regime standard deduction to ₹75,000 for FY 2025-26</li>
            <li>• Added full Advanced Tax & Deductions calculator mode</li>
            <li>• Responsive secondary navigation with zero navbar overlap</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CalculateCompo() {
  const [activeTab, setActiveTab] = useState('calculator');

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <TaxCalculator />;
      case 'results':
        return <TaxResults />;
      case 'comparison':
        return <Comparison />;
      case 'analytics':
        return <Analytics />;
      case 'features':
        return <Features />;
      case 'resources':
        return <Resources />;
      case 'changelog':
        return <Changelog />;
      case 'regime-guide':
        return <RegimeGuide />;
      case 'tax-slabs':
        return <TaxSlabs />;
      case 'hra-calculator':
        return <HRACalculator />;
      case 'advance-tax':
        return <AdvanceTaxCalculator />;
      case 'interest':
        return <InterestCalculator />;
      case 'itr-form':
        return <ITRForm />;
      default:
        return <TaxCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 relative selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default CalculateCompo;