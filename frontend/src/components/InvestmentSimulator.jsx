import React, { useState } from "react";
import { formatINR } from "@/helper/formatters";
import {
  calculateSIP,
  calculateFD,
  calculatePPF,
  calculateLumpsum
} from "@/helper/financialCalculators";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Sparkles,
  Sliders,
  ShieldCheck,
  Coins,
  Landmark,
  PiggyBank,
  PieChart
} from "lucide-react";

export default function InvestmentSimulator() {
  const [activeTab, setActiveTab] = useState("sip"); // "sip" | "fd" | "ppf" | "lumpsum" | "whatif"

  // 1. SIP State
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  const [sipStepUp, setSipStepUp] = useState(0);

  // 2. FD State
  const [fdPrincipal, setFdPrincipal] = useState(100000);
  const [fdRate, setFdRate] = useState(7.2);
  const [fdYears, setFdYears] = useState(5);
  const [fdCompoundFreq, setFdCompoundFreq] = useState(4); // 4 = Quarterly

  // 3. PPF State
  const [ppfAnnual, setPpfAnnual] = useState(150000);
  const ppfRate = 7.1;
  const ppfTenure = 15;

  // 4. Lumpsum Equity State
  const [equityPrincipal, setEquityPrincipal] = useState(50000);
  const [equityCagr, setEquityCagr] = useState(13.5);
  const [equityYears, setEquityYears] = useState(8);

  // 5. What-If Comparison States
  const [monthlyA, setMonthlyA] = useState(5000);
  const [returnA, setReturnA] = useState(12);
  const [yearsA, setYearsA] = useState(10);
  const [stepUpA, setStepUpA] = useState(0);

  const [monthlyB, setMonthlyB] = useState(10000);
  const [returnB, setReturnB] = useState(14);
  const [yearsB, setYearsB] = useState(10);
  const [stepUpB, setStepUpB] = useState(10);

  const resSIP = calculateSIP(sipMonthly, sipReturn, sipYears, sipStepUp);
  const resFD = calculateFD(fdPrincipal, fdRate, fdYears, fdCompoundFreq);
  const resPPF = calculatePPF(ppfAnnual, ppfRate, ppfTenure);
  const resEquity = calculateLumpsum(equityPrincipal, equityCagr, equityYears);

  const resA = calculateSIP(monthlyA, returnA, yearsA, stepUpA);
  const resB = calculateSIP(monthlyB, returnB, yearsB, stepUpB);

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Indian Wealth Compounding Radar</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Investment Simulator & Calculators</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Test compounding projections across SIP, Fixed Deposits, PPF, Lumpsum Equity, and Multi-Scenario What-If simulations in ₹.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("sip")}
              className={"px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 " + (activeTab === "sip" ? "gradient-bg text-white shadow-md shadow-blue-500/25" : "text-slate-400 hover:text-white")}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>SIP</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fd")}
              className={"px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 " + (activeTab === "fd" ? "gradient-bg text-white shadow-md shadow-blue-500/25" : "text-slate-400 hover:text-white")}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Fixed Deposit (FD)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ppf")}
              className={"px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 " + (activeTab === "ppf" ? "gradient-bg text-white shadow-md shadow-blue-500/25" : "text-slate-400 hover:text-white")}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>PPF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("lumpsum")}
              className={"px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 " + (activeTab === "lumpsum" ? "gradient-bg text-white shadow-md shadow-blue-500/25" : "text-slate-400 hover:text-white")}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Lumpsum Equity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("whatif")}
              className={"px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 " + (activeTab === "whatif" ? "gradient-bg text-white shadow-md shadow-blue-500/25" : "text-slate-400 hover:text-white")}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Multi-Scenario</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-3">
        {/* SIP */}
        {activeTab === "sip" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span>Systematic Investment Plan (SIP)</span>
                </h3>
                <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  {sipYears} Years Duration
                </span>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Monthly SIP Amount (₹)</Label>
                    <strong className="text-cyan-300 font-bold">{formatINR(sipMonthly)}</strong>
                  </div>
                  <Input
                    type="range"
                    min="500"
                    max="150000"
                    step="500"
                    value={sipMonthly}
                    onChange={(e) => setSipMonthly(Number(e.target.value))}
                    className="accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>₹500</span>
                    <span>₹75,000</span>
                    <span>₹1,50,000</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Expected Annual Return Rate (%)</Label>
                    <strong className="text-emerald-300 font-bold">{sipReturn}% p.a.</strong>
                  </div>
                  <Input
                    type="range"
                    min="5"
                    max="30"
                    step="0.5"
                    value={sipReturn}
                    onChange={(e) => setSipReturn(Number(e.target.value))}
                    className="accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Time Horizon (Years)</Label>
                    <strong className="text-purple-300 font-bold">{sipYears} Years</strong>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="35"
                    value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    className="accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Annual Step-Up Contribution (%)</Label>
                    <strong className="text-amber-300 font-bold">{sipStepUp}% yearly boost</strong>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={sipStepUp}
                    onChange={(e) => setSipStepUp(Number(e.target.value))}
                    className="accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-950/40 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white mb-3">SIP Wealth Projection</h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total Invested Amount:</span>
                    <strong className="text-sm font-bold text-slate-200">{formatINR(resSIP.totalInvested)}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Estimated Capital Gains:</span>
                    <strong className="text-sm font-extrabold text-emerald-400">+{formatINR(resSIP.returns)}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/90 to-indigo-950/90 border border-blue-500/40 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 block">Expected Maturity Corpus</span>
                      <span className="text-2xl font-black text-white mt-0.5 block">{formatINR(resSIP.finalValue)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Projections are based on mathematical compounding equations for educational information. Actual returns depend on market asset performance.
              </p>
            </div>
          </div>
        )}

        {/* FD */}
        {activeTab === "fd" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>Fixed Deposit (FD) Return Estimator</span>
                </h3>
                <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Bank Guaranteed
                </span>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <Label className="text-slate-300 block mb-1">Principal Deposit Amount (₹)</Label>
                  <Input
                    type="number"
                    value={fdPrincipal}
                    onChange={(e) => setFdPrincipal(Math.max(0, Number(e.target.value)))}
                    className="h-10 rounded-xl bg-slate-950 border-slate-700 text-white font-extrabold text-sm"
                    placeholder="e.g. 100000"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Annual Interest Rate (%)</Label>
                    <strong className="text-amber-300 font-bold">{fdRate}% p.a.</strong>
                  </div>
                  <Input
                    type="range"
                    min="3.5"
                    max="9.5"
                    step="0.1"
                    value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    className="accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Tenure (Years)</Label>
                    <strong className="text-purple-300 font-bold">{fdYears} Years</strong>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={fdYears}
                    onChange={(e) => setFdYears(Number(e.target.value))}
                    className="accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 block mb-1">Compounding Frequency</Label>
                  <select
                    value={fdCompoundFreq}
                    onChange={(e) => setFdCompoundFreq(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-slate-950 border border-slate-700 text-white px-3 text-xs font-semibold"
                  >
                    <option value={4}>Quarterly (Standard Indian Bank FD)</option>
                    <option value={12}>Monthly Compounding</option>
                    <option value={1}>Annual Compounding</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/30 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white mb-3">Fixed Deposit Maturity Breakdown</h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Initial Principal Deposit:</span>
                    <strong className="text-sm font-bold text-slate-200">{formatINR(resFD.principal)}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total Interest Earned:</span>
                    <strong className="text-sm font-extrabold text-amber-400">+{formatINR(resFD.interestEarned)}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 to-slate-900/90 border border-amber-500/40 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">Total Maturity Value</span>
                      <span className="text-2xl font-black text-white mt-0.5 block">{formatINR(resFD.maturityAmount)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md">
                      <Landmark className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Note: Bank FD interest is taxable per applicable slab rates under "Income from Other Sources". TDS applies if annual interest exceeds ₹40,000.
              </p>
            </div>
          </div>
        )}

        {/* PPF */}
        {activeTab === "ppf" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <PiggyBank className="w-4 h-4 text-emerald-400" />
                  <span>Public Provident Fund (PPF)</span>
                </h3>
                <span className="text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  EEE Tax-Free
                </span>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <Label className="text-slate-300 block mb-1">Annual Deposit Amount (Max ₹1.5 Lakhs / yr)</Label>
                  <Input
                    type="number"
                    max={150000}
                    value={ppfAnnual}
                    onChange={(e) => setPpfAnnual(Math.min(150000, Math.max(0, Number(e.target.value))))}
                    className="h-10 rounded-xl bg-slate-950 border-slate-700 text-white font-extrabold text-sm"
                    placeholder="e.g. 150000"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Qualifies for Section 80C tax deduction in Old Regime</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Statutory Govt Rate:</span>
                    <strong className="text-emerald-400 font-bold">{ppfRate}% p.a. (Govt Guaranteed)</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Lock-in Period:</span>
                    <strong className="text-slate-200 font-bold">{ppfTenure} Years</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Tax Exemption Status:</span>
                    <strong className="text-emerald-300 font-bold">Exempt-Exempt-Exempt (EEE)</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/30 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white mb-3">15-Year PPF Maturity Corpus</h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total 15-Yr Investment:</span>
                    <strong className="text-sm font-bold text-slate-200">{formatINR(resPPF.totalInvested)}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total Tax-Free Interest:</span>
                    <strong className="text-sm font-extrabold text-emerald-400">+{formatINR(resPPF.interestEarned)}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">100% Tax-Free Maturity Corpus</span>
                      <span className="text-2xl font-black text-white mt-0.5 block">{formatINR(resPPF.maturityAmount)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-md">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * PPF returns and maturity proceeds are 100% exempt from income tax under sovereign Indian law.
              </p>
            </div>
          </div>
        )}

        {/* LUMPSUM EQUITY */}
        {activeTab === "lumpsum" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  <span>One-Time Lumpsum Equity Calculator</span>
                </h3>
                <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  {equityYears} Yrs Horizon
                </span>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <Label className="text-slate-300 block mb-1">One-Time Lumpsum Investment (₹)</Label>
                  <Input
                    type="number"
                    value={equityPrincipal}
                    onChange={(e) => setEquityPrincipal(Math.max(0, Number(e.target.value)))}
                    className="h-10 rounded-xl bg-slate-950 border-slate-700 text-white font-extrabold text-sm"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Expected CAGR Growth Rate (%)</Label>
                    <strong className="text-emerald-300 font-bold">{equityCagr}% p.a.</strong>
                  </div>
                  <Input
                    type="range"
                    min="6"
                    max="30"
                    step="0.5"
                    value={equityCagr}
                    onChange={(e) => setEquityCagr(Number(e.target.value))}
                    className="accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Investment Horizon (Years)</Label>
                    <strong className="text-purple-300 font-bold">{equityYears} Years</strong>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="30"
                    value={equityYears}
                    onChange={(e) => setEquityYears(Number(e.target.value))}
                    className="accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-950/30 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white mb-3">Equity Growth Projection</h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Initial Capital Deployed:</span>
                    <strong className="text-sm font-bold text-slate-200">{formatINR(resEquity.invested)}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total Capital Gains:</span>
                    <strong className="text-sm font-extrabold text-emerald-400">+{formatINR(resEquity.capitalGains)}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">Final Estimated Corpus</span>
                      <span className="text-2xl font-black text-white mt-0.5 block">{formatINR(resEquity.finalCorpus)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Long-term capital gains (LTCG) on equity mutual funds over ₹1.25 Lakhs per financial year are taxed at 12.5%.
              </p>
            </div>
          </div>
        )}

        {/* WHAT-IF MULTI-SCENARIO */}
        {activeTab === "whatif" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* SCENARIO A */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span>Scenario A (Baseline SIP)</span>
                </h3>
                <span className="text-xs font-bold text-blue-300 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  {yearsA} Years
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Monthly Investment</Label>
                    <strong className="text-cyan-300 font-bold">{formatINR(monthlyA)}</strong>
                  </div>
                  <Input
                    type="range"
                    min="1000"
                    max="100000"
                    step="500"
                    value={monthlyA}
                    onChange={(e) => setMonthlyA(Number(e.target.value))}
                    className="accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Expected Annual Return (%)</Label>
                    <strong className="text-emerald-300 font-bold">{returnA}% p.a.</strong>
                  </div>
                  <Input
                    type="range"
                    min="6"
                    max="25"
                    step="0.5"
                    value={returnA}
                    onChange={(e) => setReturnA(Number(e.target.value))}
                    className="accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Duration (Years)</Label>
                    <strong className="text-purple-300 font-bold">{yearsA} Years</strong>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="35"
                    value={yearsA}
                    onChange={(e) => setYearsA(Number(e.target.value))}
                    className="accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Annual Step-Up (%)</Label>
                    <strong className="text-amber-300 font-bold">{stepUpA}% / year</strong>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={stepUpA}
                    onChange={(e) => setStepUpA(Number(e.target.value))}
                    className="accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Amount Invested:</span>
                  <strong className="text-slate-200">{formatINR(resA.totalInvested)}</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Estimated Returns:</span>
                  <strong className="text-emerald-400 font-extrabold">+{formatINR(resA.returns)}</strong>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Final Corpus:</span>
                  <span className="text-lg font-black text-cyan-300">{formatINR(resA.finalValue)}</span>
                </div>
              </div>
            </div>

            {/* SCENARIO B */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Scenario B (Optimized / Step-Up)</span>
                </h3>
                <span className="text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {yearsB} Years
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Monthly Investment</Label>
                    <strong className="text-cyan-300 font-bold">{formatINR(monthlyB)}</strong>
                  </div>
                  <Input
                    type="range"
                    min="1000"
                    max="100000"
                    step="500"
                    value={monthlyB}
                    onChange={(e) => setMonthlyB(Number(e.target.value))}
                    className="accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Expected Annual Return (%)</Label>
                    <strong className="text-emerald-300 font-bold">{returnB}% p.a.</strong>
                  </div>
                  <Input
                    type="range"
                    min="6"
                    max="25"
                    step="0.5"
                    value={returnB}
                    onChange={(e) => setReturnB(Number(e.target.value))}
                    className="accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Duration (Years)</Label>
                    <strong className="text-purple-300 font-bold">{yearsB} Years</strong>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="35"
                    value={yearsB}
                    onChange={(e) => setYearsB(Number(e.target.value))}
                    className="accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <Label>Annual Step-Up (%)</Label>
                    <strong className="text-amber-300 font-bold">{stepUpB}% / year</strong>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={stepUpB}
                    onChange={(e) => setStepUpB(Number(e.target.value))}
                    className="accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Amount Invested:</span>
                  <strong className="text-slate-200">{formatINR(resB.totalInvested)}</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Estimated Returns:</span>
                  <strong className="text-emerald-400 font-extrabold">+{formatINR(resB.returns)}</strong>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Final Corpus:</span>
                  <span className="text-lg font-black text-emerald-400">{formatINR(resB.finalValue)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
