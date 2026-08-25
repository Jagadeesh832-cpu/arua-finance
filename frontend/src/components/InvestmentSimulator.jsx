import React, { useState } from "react";
import { formatINR } from "@/helper/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Sparkles,
  Zap,
  Sliders,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Coins,
  ArrowRight
} from "lucide-react";

export default function InvestmentSimulator() {
  // Scenario A States
  const [monthlyA, setMonthlyA] = useState(5000);
  const [returnA, setReturnA] = useState(12);
  const [yearsA, setYearsA] = useState(10);
  const [stepUpA, setStepUpA] = useState(0);

  // Scenario B States (Comparison)
  const [showComparison, setShowComparison] = useState(true);
  const [monthlyB, setMonthlyB] = useState(10000);
  const [returnB, setReturnB] = useState(14);
  const [yearsB, setYearsB] = useState(10);
  const [stepUpB, setStepUpB] = useState(10);

  // Compounding SIP Calculation helper with step-up
  const calculateSIP = (monthly, annualRate, years, stepUpPct = 0) => {
    const monthlyRate = annualRate / 12 / 100;
    let totalInvested = 0;
    let totalValue = 0;
    let currentMonthly = monthly;

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentMonthly;
        totalValue = (totalValue + currentMonthly) * (1 + monthlyRate);
      }
      if (stepUpPct > 0) {
        currentMonthly += currentMonthly * (stepUpPct / 100);
      }
    }

    const returns = Math.round(totalValue - totalInvested);
    return {
      totalInvested: Math.round(totalInvested),
      returns: Math.max(0, returns),
      finalValue: Math.round(totalValue)
    };
  };

  const resA = calculateSIP(Number(monthlyA) || 0, Number(returnA) || 0, Number(yearsA) || 1, Number(stepUpA) || 0);
  const resB = calculateSIP(Number(monthlyB) || 0, Number(returnB) || 0, Number(yearsB) || 1, Number(stepUpB) || 0);

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compounding Wealth Radar</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>What-If Investment Simulator</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Test compounding scenarios: &quot;If I invest ₹5,000 per month for 10 years, what could it become?&quot;
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs h-8 rounded-xl border-slate-700 text-cyan-300 hover:bg-slate-800 self-start sm:self-auto"
          >
            {showComparison ? "Hide Comparison" : "Compare 2 Scenarios"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ========================================== */}
          {/* SCENARIO A                                 */}
          {/* ========================================== */}
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

            {/* Inputs */}
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

            {/* Results Box */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Amount Invested:</span>
                <strong className="text-slate-200">{formatINR(resA.totalInvested)}</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated Returns (Gains):</span>
                <strong className="text-emerald-400 font-extrabold">+{formatINR(resA.returns)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Final Corpus:</span>
                <span className="text-lg font-black text-cyan-300">{formatINR(resA.finalValue)}</span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* SCENARIO B (COMPARISON)                    */}
          {/* ========================================== */}
          {showComparison && (
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

              {/* Inputs */}
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

              {/* Results Box */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Amount Invested:</span>
                  <strong className="text-slate-200">{formatINR(resB.totalInvested)}</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Estimated Returns (Gains):</span>
                  <strong className="text-emerald-400 font-extrabold">+{formatINR(resB.returns)}</strong>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Final Corpus:</span>
                  <span className="text-lg font-black text-emerald-300">{formatINR(resB.finalValue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delta Comparison Banner */}
        {showComparison && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-emerald-950/40 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Compounding Advantage:</span>
              <span className="text-sm font-extrabold text-white">
                Scenario B yields{" "}
                <strong className="text-emerald-400 font-black">
                  {formatINR(Math.abs(resB.finalValue - resA.finalValue))}
                </strong>{" "}
                {resB.finalValue >= resA.finalValue ? "more wealth" : "less"} than Scenario A
              </span>
            </div>
            <span className="text-[11px] text-cyan-300 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Power of 10% Annual Step-Up 🚀
            </span>
          </div>
        )}

        {/* Regulatory Disclaimer */}
        <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-800/80 pt-3">
          ⚠️ Disclaimer: Calculations are for illustrative purposes based on compounding mathematics. Mutual fund investments and equity securities are subject to market risks; past performance does not guarantee future returns.
        </p>
      </CardContent>
    </Card>
  );
}
