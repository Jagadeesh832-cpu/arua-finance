import React, { useState, useEffect } from "react";
import { useAuth } from "@/helper/auth";
import { formatINR } from "@/helper/formatters";
import UpdateUserDataFunc from "@/helper/UpdateUserDataFunc";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Shield,
  TrendingUp,
  Wallet,
  Home
} from "lucide-react";

export default function SmartBudgetGenerator() {
  const { LoggedInUserData, setLoggedInUserData } = useAuth();

  const userAnnual = LoggedInUserData?.annualIncome || 600000;
  const initialMonthly = Math.round(userAnnual / 12);

  const [monthlyIncome, setMonthlyIncome] = useState(String(initialMonthly || 50000));
  const [needsPct, setNeedsPct] = useState(LoggedInUserData?.budgetBreakdown?.needs || 50);
  const [wantsPct, setWantsPct] = useState(LoggedInUserData?.budgetBreakdown?.wants || 20);
  const [savingsPct, setSavingsPct] = useState(LoggedInUserData?.budgetBreakdown?.savings || 15);
  const [investmentsPct, setInvestmentsPct] = useState(LoggedInUserData?.budgetBreakdown?.investments || 10);
  const [emergencyPct, setEmergencyPct] = useState(LoggedInUserData?.budgetBreakdown?.emergencyFund || 5);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const totalPct = needsPct + wantsPct + savingsPct + investmentsPct + emergencyPct;

  const income = Math.max(0, parseFloat(monthlyIncome) || 0);
  const needsAmt = Math.round((income * needsPct) / 100);
  const wantsAmt = Math.round((income * wantsPct) / 100);
  const savingsAmt = Math.round((income * savingsPct) / 100);
  const investmentsAmt = Math.round((income * investmentsPct) / 100);
  const emergencyAmt = Math.round((income * emergencyPct) / 100);

  // Preset 50/20/15/10/5 Rule
  const applyStandardRule = () => {
    setNeedsPct(50);
    setWantsPct(20);
    setSavingsPct(15);
    setInvestmentsPct(10);
    setEmergencyPct(5);
  };

  // Preset Aggressive Wealth Rule
  const applyAggressiveRule = () => {
    setNeedsPct(40);
    setWantsPct(15);
    setSavingsPct(10);
    setInvestmentsPct(25);
    setEmergencyPct(10);
  };

  const handleSaveBudget = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const identifier = LoggedInUserData?.phoneNumber || LoggedInUserData?.email;
      if (!identifier) {
        setSaveError("Please sign in to save your budget.");
        return;
      }

      if (totalPct !== 100) {
        setSaveError("Total allocation percentage must equal exactly 100%. Current: " + totalPct + "%.");
        return;
      }

      const allocatedMonthlyBudget = needsAmt + wantsAmt;

      const updated = await UpdateUserDataFunc({
        identifier,
        email: LoggedInUserData?.email,
        phoneNumber: LoggedInUserData?.phoneNumber,
        annualIncome: income * 12,
        monthlyBudget: allocatedMonthlyBudget,
        budgetBreakdown: {
          needs: needsPct,
          wants: wantsPct,
          savings: savingsPct,
          investments: investmentsPct,
          emergencyFund: emergencyPct
        }
      });

      if (updated && (updated.user || updated.email || updated._id)) {
        setLoggedInUserData(updated.user || updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError("Failed to update budget in database.");
      }
    } catch (err) {
      console.error("Budget save error:", err);
      setSaveError(err.message || "Failed to save budget.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Rupee Allocation Engine</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Smart Budget Generator</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Generate and calibrate your personalized 5-pillar monthly budget for Indian wealth creation.
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyStandardRule}
              className="text-xs h-8 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              50/20 Balanced
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyAggressiveRule}
              className="text-xs h-8 rounded-xl border-blue-500/40 text-cyan-300 hover:bg-blue-500/20"
            >
              Aggressive Wealth
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <Label className="text-xs font-bold text-slate-300">Total Monthly Net In-Hand Income (₹)</Label>
          <Input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="h-11 rounded-xl bg-slate-900 border-slate-700 text-white font-black text-base focus-visible:ring-blue-500"
            placeholder="e.g. 50000"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">5-Pillar Rupee Allocation Calibration</span>
            <span className={"font-extrabold px-2.5 py-0.5 rounded-full border " + (totalPct === 100 ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border-rose-500/30")}>
              Total: {totalPct}% {totalPct === 100 ? "✅ Balanced" : "⚠️ Needs 100%"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Needs */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-blue-400" /> Needs</span>
                <span className="font-extrabold text-blue-400">{needsPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={needsPct}
                onChange={(e) => setNeedsPct(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
              <div className="text-xs font-extrabold text-white">{formatINR(needsAmt)}</div>
            </div>

            {/* Wants */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-purple-400" /> Wants</span>
                <span className="font-extrabold text-purple-400">{wantsPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wantsPct}
                onChange={(e) => setWantsPct(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
              <div className="text-xs font-extrabold text-white">{formatINR(wantsAmt)}</div>
            </div>

            {/* Savings */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-400" /> Savings</span>
                <span className="font-extrabold text-emerald-400">{savingsPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={savingsPct}
                onChange={(e) => setSavingsPct(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
              <div className="text-xs font-extrabold text-white">{formatINR(savingsAmt)}</div>
            </div>

            {/* Investments */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> SIP/Equity</span>
                <span className="font-extrabold text-cyan-400">{investmentsPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={investmentsPct}
                onChange={(e) => setInvestmentsPct(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
              <div className="text-xs font-extrabold text-white">{formatINR(investmentsAmt)}</div>
            </div>

            {/* Emergency Reserve */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-400" /> Emergency</span>
                <span className="font-extrabold text-amber-400">{emergencyPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={emergencyPct}
                onChange={(e) => setEmergencyPct(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
              <div className="text-xs font-extrabold text-white">{formatINR(emergencyAmt)}</div>
            </div>
          </div>
        </div>

        {saveError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Smart Budget updated successfully in your MongoDB profile!</span>
          </div>
        )}

        <Button
          onClick={handleSaveBudget}
          disabled={isSaving || totalPct !== 100}
          className="w-full gradient-bg text-white font-bold h-11 rounded-xl text-xs sm:text-sm border border-blue-400/30 shadow-lg shadow-blue-500/20"
        >
          {isSaving ? "Saving Budget to MongoDB..." : "Save & Synchronize Smart Budget"}
        </Button>
      </CardContent>
    </Card>
  );
}
