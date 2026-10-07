import React, { useState } from "react";
import { useAuth } from "@/helper/auth";
import { formatINR } from "@/helper/formatters";
import { calculateEmergencyFund } from "@/helper/financialCalculators";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ShieldCheck,
  Zap,
  TrendingUp,
  Wallet
} from "lucide-react";

export default function EmergencyFundCalculator() {
  const { LoggedInUserData } = useAuth();

  const userExpenses = LoggedInUserData?.expenses || [];
  const calculatedMonthlySpend = userExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || Number(LoggedInUserData?.monthlyExpense) || 25000;
  const initialSavings = Number(LoggedInUserData?.savings) || 50000;

  const [monthlySpend, setMonthlySpend] = useState(String(calculatedMonthlySpend));
  const [currentSavings, setCurrentSavings] = useState(String(initialSavings));

  const stats = calculateEmergencyFund(monthlySpend, currentSavings);

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
              Calculate and stress-test your emergency liquidity cushion across 3, 6, and 12-month scenarios in ₹.
            </CardDescription>
          </div>

          <span className="text-xs font-bold text-amber-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            {stats.progressPct}% of 6-Mo Goal Funded
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
              onChange={(e) => setMonthlySpend(e.target.value)}
              className="h-10 rounded-xl bg-slate-900 border-slate-700 text-white font-extrabold text-sm focus-visible:ring-blue-500"
              placeholder="e.g. 25000"
            />
            <p className="text-[10px] text-slate-500">Rent, Food, EMIs, Utilities</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Current Liquid Savings / FDs (₹)</Label>
            <Input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="h-10 rounded-xl bg-slate-900 border-slate-700 text-white font-extrabold text-sm focus-visible:ring-blue-500"
              placeholder="e.g. 50000"
            />
            <p className="text-[10px] text-slate-500">Easily accessible within 24-48 hours</p>
          </div>
        </div>

        {/* Progress Bar towards 6-Month Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Current Savings: <strong className="text-white">{formatINR(stats.savings)}</strong>
            </span>
            <span className="text-slate-400">
              6-Month Goal: <strong className="text-amber-300">{formatINR(stats.rec6Months)}</strong>
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className={"h-full rounded-full transition-all duration-500 " + (
                stats.progressPct >= 100
                  ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                  : stats.progressPct >= 50
                  ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                  : "bg-gradient-to-r from-rose-500 to-amber-400"
              )}
              style={{ width: stats.progressPct + "%" }}
            ></div>
          </div>
        </div>

        {/* 3 Tier Target Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 3 Months */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">3 Months Minimum</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Baseline
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">{formatINR(stats.min3Months)}</div>
            <p className="text-[11px] text-slate-400">
              {stats.savings >= stats.min3Months ? "✅ Threshold Met" : "⚠️ Needs " + formatINR(stats.min3Months - stats.savings) + " more"}
            </p>
          </div>

          {/* 6 Months */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900/90 border border-amber-500/40 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">6 Months Recommended</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gold Standard
              </span>
            </div>
            <div className="text-xl font-extrabold text-amber-300">{formatINR(stats.rec6Months)}</div>
            <p className="text-[11px] text-slate-300">
              {stats.isFunded ? "🎉 Fully Funded & Secure" : "Needs " + formatINR(stats.shortfall) + " more"}
            </p>
          </div>

          {/* 12 Months */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">12 Months Fortress</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Maximum Shield
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">{formatINR(stats.max12Months)}</div>
            <p className="text-[11px] text-slate-400">
              {stats.savings >= stats.max12Months ? "🛡️ Maximum Fortress Achieved" : "Needs " + formatINR(stats.max12Months - stats.savings) + " more"}
            </p>
          </div>
        </div>

        {/* Actionable Savings Plan if not fully funded */}
        {!stats.isFunded && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended Liquidity Accumulation Pace</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">6-Month Fast Track:</span>
                <strong className="text-cyan-300 font-extrabold text-sm">{formatINR(stats.monthlySavingsFor6Months)} / month</strong>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">12-Month Balanced Plan:</span>
                <strong className="text-emerald-300 font-extrabold text-sm">{formatINR(stats.monthlySavingsFor12Months)} / month</strong>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
