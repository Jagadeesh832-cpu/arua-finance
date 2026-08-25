import React, { useState } from "react";
import { useAuth } from "@/helper/auth";
import { calculateHealthScore } from "@/helper/healthScore";
import { formatINR } from "@/helper/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  Award
} from "lucide-react";

export default function FinancialHealthScore({ onNavigateTab }) {
  const { LoggedInUserData } = useAuth();
  const health = calculateHealthScore(LoggedInUserData);

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const getStatusBadge = () => {
    switch (health.status) {
      case "Excellent":
        return {
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: ShieldCheck,
          text: "Excellent • Wealth Compounder"
        };
      case "Good":
        return {
          bg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          icon: CheckCircle2,
          text: "Good • Healthy Foundation"
        };
      case "Needs Attention":
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertCircle,
          text: "Needs Attention • Optimization Required"
        };
      default:
        return {
          bg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: AlertCircle,
          text: "At Risk • High Burn Rate"
        };
    }
  };

  const badge = getStatusBadge();
  const BadgeIcon = badge.icon;

  const fetchAiSuggestions = async () => {
    setIsLoadingAi(true);
    try {
      const baseUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_ServerUrl || "";
      const res = await fetch(`${baseUrl}/api/ai/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide 3 specific, highly actionable recommendations to increase my Financial Health Score from ${health.overallScore}/100 to 95+ in India.`,
          userData: LoggedInUserData
        })
      });
      const data = await res.json();
      if (data.response) {
        setAiAnalysis(data.response);
      } else {
        setAiAnalysis("1. Increase monthly SIP allocation by 10% to boost your Savings Rate.\n2. Ensure your Emergency Fund covers at least 6 months of expenses.\n3. Align discretionary expense categories to remain under 80% of budget.");
      }
    } catch (e) {
      setAiAnalysis("1. Direct at least 25% of monthly income into diversified equity SIPs.\n2. Build a dedicated 6-month liquid emergency cushion.\n3. Utilize Section 80C ELSS investments for dual tax savings.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Algorithmic Telemetry • FY 2025–26</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Financial Health Score</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Multi-factor assessment based on your real savings, spending discipline, emergency readiness, and goals.
            </CardDescription>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl border text-xs font-extrabold shrink-0 shadow-md ${badge.bg}`}>
            <BadgeIcon className="w-4 h-4" />
            <span>{badge.text}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Hero Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-blue-950/40 border border-slate-800/90 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radial Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`transition-all duration-1000 ${
                    health.overallScore >= 80
                      ? "stroke-emerald-400"
                      : health.overallScore >= 65
                      ? "stroke-blue-400"
                      : health.overallScore >= 45
                      ? "stroke-amber-400"
                      : "stroke-rose-400"
                  }`}
                  strokeWidth="8"
                  strokeDasharray={`${(health.overallScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white tracking-tight">{health.overallScore}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">out of 100</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-semibold mt-2">{health.status}</p>
          </div>

          {/* Rationale & Explanation */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-300 text-sm font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Score Rationale & Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {health.message}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Savings Rate</span>
                <strong className="text-cyan-300 text-xs font-extrabold">{health.savingsRate}%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Emergency Fund</span>
                <strong className="text-emerald-300 text-xs font-extrabold">
                  {formatINR(LoggedInUserData?.savings || 50000)}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Active Goals</span>
                <strong className="text-purple-300 text-xs font-extrabold">
                  {(LoggedInUserData?.goals || []).length} Goals
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Category Score Pillars */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Performance Across 6 Pillars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(health.pillars).map(([key, pillar]) => {
              const pct = Math.round((pillar.score / pillar.max) * 100);
              return (
                <div
                  key={key}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{pillar.label}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 text-[11px] font-medium">{pillar.value}</span>
                      <span className="font-extrabold text-cyan-300 text-[11px] px-1.5 py-0.5 rounded bg-slate-800">
                        {pillar.score}/{pillar.max}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : pct >= 50
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                          : "bg-gradient-to-r from-rose-500 to-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Improvement Action Plan Box */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>AI Health Score Improvement Plan</span>
            </div>
            <Button
              onClick={fetchAiSuggestions}
              disabled={isLoadingAi}
              variant="outline"
              className="h-8 text-xs font-bold border-blue-500/40 text-cyan-300 hover:bg-blue-500/20 rounded-xl"
            >
              {isLoadingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Get AI Advice
                </>
              )}
            </Button>
          </div>

          {aiAnalysis ? (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
              {aiAnalysis}
            </div>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong>Get AI Advice</strong> to receive personalized recommendations generated by Google Gemini to boost your Financial Health Score.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
