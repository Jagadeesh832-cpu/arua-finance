import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/helper/auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getFinancialAdvice } from "../helper/GetFinancialAdvice";
import { formatINR } from "@/helper/formatters";
import { Bot, Loader2, AlertCircle, TrendingUp, Shield, Zap, Sparkles, CheckCircle2, IndianRupee } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const recommendationTypes = [
  { key: "investment", label: "Investment Plan", hint: "Build long-term wealth using diversified Indian asset classes." },
  { key: "tax", label: "Tax Saving (80C/ELSS)", hint: "Explore Section 80C, ELSS funds, and PPF optimization." },
  { key: "retirement", label: "Retirement Corpus", hint: "Plan for financial freedom with compounding targets in ₹." },
  { key: "budgeting", label: "Rupee Budgeting", hint: "Optimize discretionary spending and increase monthly savings." },
];

export default function AIRecommendations() {
  const { LoggedInUserData } = useAuth();
  const [recommendationType, setRecommendationType] = useState("investment");
  const [error, setError] = useState("");

  const [monthlyExpense, setMonthlyExpense] = useState("");
  const [savings, setSavings] = useState("");
  const [investmentHorizon, setInvestmentHorizon] = useState("");
  const [preferredAssets, setPreferredAssets] = useState("");
  const [riskTolerance, setriskTolerance] = useState(LoggedInUserData?.riskTolerance || "Medium");

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  const emergencyFund = (LoggedInUserData?.annualIncome || 0) * 0.5;
  const recommendations = [
    {
      type: "Emergency Reserve Fund",
      description: `Build a liquid emergency fund of ${formatINR(emergencyFund)} (6 months of baseline living expenses)`,
      allocation: "20% of income",
      risk: "Low",
      icon: Shield,
      color: "bg-emerald-600",
      priority: "High"
    },
    {
      type: "SIP in Diversified Index & Mutual Funds",
      description: `Invest ${formatINR(Math.round(((LoggedInUserData?.annualIncome || 0) * 0.25) / 12))}/month in Nifty 50 & flexi-cap index funds`,
      allocation: "25% of income",
      risk: "Medium",
      icon: TrendingUp,
      color: "bg-blue-600",
      priority: "High"
    },
    {
      type: "Tax-Saving ELSS & PPF",
      description: `Allocate up to ${formatINR(150000)} annually in ELSS funds for equity growth and Section 80C deductions`,
      allocation: "15% of income",
      risk: "Medium",
      icon: Zap,
      color: "bg-cyan-600",
      priority: "Medium"
    },
    {
      type: "Direct Bluechip Equity",
      description: `Direct stock portfolio in Indian market leaders with consistent return on capital`,
      allocation: "20% of income",
      risk: "High",
      icon: Zap,
      color: "bg-purple-600",
      priority: "Medium"
    },
    {
      type: "Sovereign Gold Bonds / Gold ETFs",
      description: `Inflation hedge allocation to protect purchasing power during equity market volatility`,
      allocation: "10% of income",
      risk: "Low",
      icon: Shield,
      color: "bg-amber-600",
      priority: "Medium"
    }
  ];

  const fetchAllAICards = async () => {
    if (!LoggedInUserData) return;
    setAiGenerating(true);
    setError("");
    const results = [];
    for (const rec of recommendations) {
      const result = await getFinancialAdvice({
        age: LoggedInUserData.age || 24,
        annualIncome: LoggedInUserData.annualIncome || 500000,
        riskTolerance: riskTolerance || "Medium",
        monthlyExpense: parseInt(monthlyExpense) || 20000,
        savings: parseInt(savings) || 50000,
        investmentHorizon: parseInt(investmentHorizon) || 5,
        financialGoal: rec.type,
        preferredAssets: preferredAssets || "Mutual Funds, Stocks, Gold",
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GeminiAPI || "",
        customPrompt: `Provide concise, highly actionable financial advice in India for ${rec.type} with ${formatINR(LoggedInUserData.annualIncome || 0)} annual income and ${riskTolerance} risk profile.`
      });
      results.push({
        ...rec,
        aiAdvice: result.ok ? result.advice : `❌ ${result.error || "Error generating advice"}`
      });
    }
    setAiRecommendations(results);
    setAiGenerating(false);
  };

  if (!LoggedInUserData) {
    return (
      <Card className="arua-card rounded-2xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Wealth Recommendations
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Sign in to unlock personalized algorithmic insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-xs">Complete your profile to receive real-time Gemini AI suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="arua-card rounded-2xl animate-slide-up border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Arua AI Wealth Advisory</span>
          </CardTitle>
          <span className="text-[11px] font-bold text-cyan-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
            Gemini 2.0 Engine
          </span>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Calibrated for {formatINR(LoggedInUserData.annualIncome || 0)}/yr • Risk: {riskTolerance || "Medium"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {recommendationTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setRecommendationType(type.key)}
              className={`text-xs py-1.5 px-2 rounded-lg font-semibold transition-all ${
                recommendationType === type.key
                  ? "bg-gradient-to-r from-blue-600/40 to-violet-600/40 text-cyan-300 border border-blue-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 italic">
          💡 {recommendationTypes.find((t) => t.key === recommendationType)?.hint}
        </p>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <Label className="text-[11px] text-slate-400 mb-1 block">Monthly Expenses (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 25000"
              value={monthlyExpense}
              onChange={(e) => setMonthlyExpense(e.target.value)}
              className="text-xs h-9 rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-400 mb-1 block">Current Savings (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 100000"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              className="text-xs h-9 rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-400 mb-1 block">Investment Horizon (Years)</Label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={investmentHorizon}
              onChange={(e) => setInvestmentHorizon(e.target.value)}
              className="text-xs h-9 rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-400 mb-1 block">Risk Profile</Label>
            <Select value={riskTolerance} onValueChange={(value) => setriskTolerance(value)}>
              <SelectTrigger className="text-xs h-9 rounded-xl bg-slate-950/70 border-slate-800 text-white focus:ring-blue-500">
                <SelectValue placeholder="Select risk profile" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="Low">Low (Capital Preservation)</SelectItem>
                <SelectItem value="Medium">Medium (Balanced Growth)</SelectItem>
                <SelectItem value="High">High (Aggressive Wealth)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="p-3.5 bg-blue-950/30 rounded-xl border border-blue-500/20 text-xs">
          <div className="flex items-center space-x-1.5 mb-1 text-cyan-300 font-bold">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Arua Intelligence Memo</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {riskTolerance === "Low"
              ? "Conservative profile selected: Priority on capital security via PPF, FDs, and debt mutual funds."
              : riskTolerance === "Medium"
              ? "Balanced profile selected: Optimal 60/40 mix of equity index funds and capital-preserving debt instruments."
              : "High-growth profile selected: Accelerated equity exposure with compounding potential over 5+ year horizons."}
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={fetchAllAICards}
          disabled={aiGenerating}
          className="w-full gradient-bg text-white font-bold rounded-xl text-xs sm:text-sm py-2.5 shadow-lg shadow-blue-500/20 hover:scale-102 transition-all border border-blue-400/30"
        >
          {aiGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" /> Generating AI Strategy...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Generate Full AI Investment Strategy (₹)
            </span>
          )}
        </Button>

        {error && (
          <div className="text-rose-400 text-xs flex items-center gap-1.5 p-2 bg-rose-950/40 border border-rose-800/40 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generated Recommendations List */}
        <div className="space-y-3 pt-2">
          {(aiRecommendations.length > 0 ? aiRecommendations : recommendations).map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div
                key={index}
                className="p-4 bg-slate-900/60 border border-slate-800/90 rounded-xl hover:border-blue-500/40 transition-all text-xs space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 ${rec.color} rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{rec.type}</h4>
                      <p className="text-[11px] text-slate-400">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Badge variant="outline" className="text-[10px] font-semibold border-slate-700 text-slate-300">
                      {rec.risk} Risk
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-cyan-300 bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-800/40 font-medium">
                  <span>Allocation: {rec.allocation}</span>
                  <span>Priority: {rec.priority}</span>
                </div>

                {rec.aiAdvice && (
                  <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-[11px] leading-relaxed">
                    <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>AI Advisory Breakdown:</span>
                    </div>
                    <div className="prose prose-invert prose-xs max-w-none text-slate-300">
                      <Markdown remarkPlugins={[remarkGfm]}>{rec.aiAdvice}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}