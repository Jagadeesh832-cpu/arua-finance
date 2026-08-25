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
  IndianRupee,
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

  const [monthlyIncome, setMonthlyIncome] = useState(initialMonthly || 50000);
  const [needsPct, setNeedsPct] = useState(LoggedInUserData?.budgetBreakdown?.needs || 50);
  const [wantsPct, setWantsPct] = useState(LoggedInUserData?.budgetBreakdown?.wants || 20);
  const [savingsPct, setSavingsPct] = useState(LoggedInUserData?.budgetBreakdown?.savings || 15);
  const [investmentsPct, setInvestmentsPct] = useState(LoggedInUserData?.budgetBreakdown?.investments || 10);
  const [emergencyPct, setEmergencyPct] = useState(LoggedInUserData?.budgetBreakdown?.emergencyFund || 5);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const totalPct = needsPct + wantsPct + savingsPct + investmentsPct + emergencyPct;

  const income = Number(monthlyIncome) || 0;
  const needsAmt = Math.round((income * needsPct) / 100);
  const wantsAmt = Math.round((income * wantsPct) / 100);
  const savingsAmt = Math.round((income * savingsPct) / 100);
  const investmentsAmt = Math.round((income * investmentsPct) / 100);
  const emergencyAmt = Math.round((income * emergencyPct) / 100);

  // Preset 50/30/20 Standard Rule
  const applyStandardRule = () => {
    setNeedsPct(50);
    setWantsPct(20);
    setSavingsPct(15);
    setInvestmentsPct(10);
    setEmergencyPct(5);
  };

  // Preset Wealth Acceleration Rule
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
        setSaveError("Please sign in to save budget.");
        return;
      }

      // Calculate total monthly expense ceiling (Needs + Wants)
      const allocatedMonthlyBudget = needsAmt + wantsAmt;

      const updated = await UpdateUserDataFunc(identifier, {
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

      if (updated) {
        setLoggedInUserData(updated);
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
      {/* Glows */}
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
              Generate and adjust your personalized 5-pillar monthly budget calibrated for Indian wealth creation.
            </CardDescription>
          </div>

          {/* Quick Presets */}
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
        {/* Income Input */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-300">Your Monthly Income (₹)</Label>
            <p className="text-[11px] text-slate-500">Enter your net in-hand monthly take-home salary or income</p>
          </div>
          <div className="relative w-full sm:w-60">
            <div className="absolute left-3 top-2.5 text-cyan-400 font-bold text-sm">₹</div>
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
              className="pl-8 h-10 rounded-xl bg-slate-900 border-slate-700 text-white font-extrabold text-sm focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Total Allocation Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Total Allocation:</span>
            <span className={totalPct === 100 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {totalPct}% {totalPct !== 100 && `(${totalPct > 100 ? `+${totalPct - 100}% over` : `${100 - totalPct}% unallocated`})`}
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 flex">
            <div style={{ width: `${needsPct}%` }} className="bg-blue-500 transition-all" title={`Needs: ${needsPct}%`}></div>
            <div style={{ width: `${wantsPct}%` }} className="bg-purple-500 transition-all" title={`Wants: ${wantsPct}%`}></div>
            <div style={{ width: `${savingsPct}%` }} className="bg-teal-400 transition-all" title={`Savings: ${savingsPct}%`}></div>
            <div style={{ width: `${investmentsPct}%` }} className="bg-emerald-400 transition-all" title={`Investments: ${investmentsPct}%`}></div>
            <div style={{ width: `${emergencyPct}%` }} className="bg-amber-400 transition-all" title={`Emergency: ${emergencyPct}%`}></div>
          </div>
        </div>

        {/* 5 Allocation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Needs */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Needs (Essentials)</h4>
                  <p className="text-[10px] text-slate-400">Rent, Groceries, EMIs, Bills</p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-300">{needsPct}%</span>
            </div>
            <div className="text-lg font-black text-white">{formatINR(needsAmt)}</div>
            <input
              type="range"
              min="20"
              max="70"
              value={needsPct}
              onChange={(e) => setNeedsPct(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Card 2: Wants */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Wants (Lifestyle)</h4>
                  <p className="text-[10px] text-slate-400">Dining, Movies, Hobbies</p>
                </div>
              </div>
              <span className="text-xs font-black text-purple-300">{wantsPct}%</span>
            </div>
            <div className="text-lg font-black text-white">{formatINR(wantsAmt)}</div>
            <input
              type="range"
              min="5"
              max="40"
              value={wantsPct}
              onChange={(e) => setWantsPct(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Card 3: Savings */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Savings (Liquid)</h4>
                  <p className="text-[10px] text-slate-400">Short-term liquid reserves</p>
                </div>
              </div>
              <span className="text-xs font-black text-teal-300">{savingsPct}%</span>
            </div>
            <div className="text-lg font-black text-white">{formatINR(savingsAmt)}</div>
            <input
              type="range"
              min="5"
              max="40"
              value={savingsPct}
              onChange={(e) => setSavingsPct(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Card 4: Investments */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Investments (SIP/Equity)</h4>
                  <p className="text-[10px] text-slate-400">Long-term compounding</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-300">{investmentsPct}%</span>
            </div>
            <div className="text-lg font-black text-white">{formatINR(investmentsAmt)}</div>
            <input
              type="range"
              min="5"
              max="50"
              value={investmentsPct}
              onChange={(e) => setInvestmentsPct(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Card 5: Emergency Fund */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Emergency Fund</h4>
                  <p className="text-[10px] text-slate-400">Safety shield contribution</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-300">{emergencyPct}%</span>
            </div>
            <div className="text-lg font-black text-white">{formatINR(emergencyAmt)}</div>
            <input
              type="range"
              min="0"
              max="25"
              value={emergencyPct}
              onChange={(e) => setEmergencyPct(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Feedback alerts */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-xs rounded-xl flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Smart budget saved and synchronized with your MongoDB profile!</span>
          </div>
        )}
        {saveError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/70 text-rose-300 text-xs rounded-xl flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSaveBudget}
          disabled={isSaving}
          className="w-full h-11 gradient-bg text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 hover:scale-102 transition-all border border-blue-400/30 flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Saving Budget to MongoDB...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Save Budget to Arua Profile</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
