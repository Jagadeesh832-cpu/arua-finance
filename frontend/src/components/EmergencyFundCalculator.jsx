import React, { useState } from "react";
import { useAuth } from "@/helper/auth";
import { formatINR } from "@/helper/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet
} from "lucide-react";

export default function EmergencyFundCalculator() {
  const { LoggedInUserData } = useAuth();

  const userExpenses = LoggedInUserData?.expenses || [];
  const calculatedMonthlySpend = userExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || Number(LoggedInUserData?.monthlyExpense) || 25000;
  const initialSavings = Number(LoggedInUserData?.savings) || 50000;

  const [monthlySpend, setMonthlySpend] = useState(calculatedMonthlySpend);
  const [currentSavings, setCurrentSavings] = useState(initialSavings);

  const spend = Number(monthlySpend) || 0;
  const savings = Number(currentSavings) || 0;

  const min3Months = spend * 3;
  const rec6Months = spend * 6;
  const max12Months = spend * 12;

  const progressPct = rec6Months > 0 ? Math.min(100, Math.round((savings / rec6Months) * 100)) : 0;
  const shortfall = Math.max(0, rec6Months - savings);

  const monthsToGoal12 = Math.round(shortfall / 12);
  const monthsToGoal6 = Math.round(shortfall / 6);

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Capital Preservation Shield</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Emergency Fund Fortress</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Calculate and stress-test your emergency liquidity cushion across 3, 6, and 12-month scenarios.
            </CardDescription>
          </div>

          <span className="text-xs font-bold text-amber-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            {progressPct}% of 6-Mo Goal Funded
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Interactive Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Baseline Monthly Living Expense (₹)</Label>
            <Input
              type="number"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Math.max(0, Number(e.target.value)))}
              className="h-10 rounded-xl bg-slate-900 border-slate-700 text-white font-extrabold text-sm focus-visible:ring-blue-500"
            />
            <p className="text-[10px] text-slate-500">Rent, Food, EMIs, Utilities</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Current Liquid Savings / FDs (₹)</Label>
            <Input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Math.max(0, Number(e.target.value)))}
              className="h-10 rounded-xl bg-slate-900 border-slate-700 text-white font-extrabold text-sm focus-visible:ring-blue-500"
            />
            <p className="text-[10px] text-slate-500">Easily accessible within 24-48 hours</p>
          </div>
        </div>

        {/* Progress Bar towards 6-Month Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Current Savings: <strong className="text-white">{formatINR(savings)}</strong>
            </span>
            <span className="text-slate-400">
              6-Month Goal: <strong className="text-amber-300">{formatINR(rec6Months)}</strong>
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPct >= 100
                  ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                  : progressPct >= 50
                  ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                  : "bg-gradient-to-r from-rose-500 to-amber-400"
              }`}
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        {/* 3 Tier Target Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 3 Months: Minimum */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">3 Months Minimum</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Baseline
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">{formatINR(min3Months)}</div>
            <p className="text-[11px] text-slate-400">
              {savings >= min3Months ? "✅ Threshold Met" : `⚠️ Needs ${formatINR(min3Months - savings)} more`}
            </p>
          </div>

          {/* 6 Months: Recommended */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900/90 border border-amber-500/40 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">6 Months Recommended</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gold Standard
              </span>
            </div>
            <div className="text-xl font-extrabold text-amber-300">{formatINR(rec6Months)}</div>
            <p className="text-[11px] text-slate-300">
              {savings >= rec6Months ? "🎉 Fully Funded & Secure" : `Needs ${formatINR(shortfall)} more`}
            </p>
          </div>

          {/* 12 Months: Fortress */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">12 Months Fortress</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                High Security
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">{formatINR(max12Months)}</div>
            <p className="text-[11px] text-slate-400">
              {savings >= max12Months ? "🛡️ Maximum Fortress" : `Gap: ${formatINR(Math.max(0, max12Months - savings))}`}
            </p>
          </div>
        </div>

        {/* Actionable Plan Box */}
        {shortfall > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Recommended Bridging Strategy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              To fully fund your 6-month safety reserve of <strong>{formatINR(rec6Months)}</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                Save <strong className="text-cyan-300">{formatINR(monthsToGoal6)}/month</strong> to reach target in 6 months
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                Save <strong className="text-emerald-300">{formatINR(monthsToGoal12)}/month</strong> to reach target in 12 months
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
