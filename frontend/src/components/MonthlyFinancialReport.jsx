import React, { useState } from "react";
import { useAuth } from "@/helper/auth";
import { formatINR } from "@/helper/formatters";
import { calculateHealthScore } from "@/helper/healthScore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Printer,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  RefreshCw,
  Award
} from "lucide-react";

export default function MonthlyFinancialReport() {
  const { LoggedInUserData } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const health = calculateHealthScore(LoggedInUserData);
  const annualIncome = Number(LoggedInUserData?.annualIncome) || 500000;
  const monthlyIncome = Math.round(annualIncome / 12);
  const monthlyBudget = Number(LoggedInUserData?.monthlyBudget) || 30000;
  const expenses = LoggedInUserData?.expenses || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const savings = Number(LoggedInUserData?.savings) || 50000;
  const goals = LoggedInUserData?.goals || [];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const identifier = LoggedInUserData?.phoneNumber || LoggedInUserData?.email;
      const baseUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_ServerUrl || "";
      const res = await fetch(`${baseUrl}/api/ai/report?identifier=${encodeURIComponent(identifier)}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReportData(data.report);
      } else {
        // Fallback local report generation
        setReportData({
          generatedAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" }),
          userName: LoggedInUserData?.name || "Investor",
          monthlyIncome,
          totalExpenses,
          surplus: Math.max(0, monthlyIncome - totalExpenses),
          savingsRate: monthlyIncome > 0 ? (((monthlyIncome - totalExpenses) / monthlyIncome) * 100).toFixed(1) : "0.0",
          savings,
          healthScore: health.overallScore,
          healthStatus: health.status,
          categoryBreakdown: [],
          goalsCount: goals.length,
          anomalies: [
            totalExpenses > monthlyBudget
              ? `Budget Overrun: Spending exceeds limit by ${formatINR(totalExpenses - monthlyBudget)}.`
              : "All monthly expenses remain strictly within allocated budget ceilings."
          ],
          aiActionPlan: `1. Direct ${formatINR(Math.round(monthlyIncome * 0.15))} towards index fund SIPs.\n2. Review high-ticket discretionary spends.\n3. Increase Section 80C ELSS contributions for tax minimization.`
        });
      }
    } catch (e) {
      console.error("Report generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Executive Synthesis</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Monthly AI Financial Report</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Generate a comprehensive audit of your income, expense telemetry, health score, tax optimization, and AI action plan.
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            {reportData && (
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="text-xs h-9 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </Button>
            )}

            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="gradient-bg text-white font-bold rounded-xl text-xs sm:text-sm px-4 py-2 border border-blue-400/30 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center space-x-1.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Monthly AI Report</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!reportData ? (
          <div className="p-10 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white">Generate Your Executive Monthly Dossier</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Click the button above to have Gemini AI analyze your logged MongoDB transactions, calculate budget compliance, detect anomalies, and formulate an actionable 30-day wealth roadmap.
              </p>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="gradient-bg text-white font-bold rounded-xl text-xs px-5 py-2.5 shadow-md shadow-blue-500/30 hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Generate Report Now
            </Button>
          </div>
        ) : (
          <div id="monthly-ai-report" className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 space-y-6 shadow-2xl animate-fade-in print:bg-white print:text-black print:p-0 print:border-none">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black tracking-tight text-white print:text-black">
                    Arua <span className="gradient-text">Finance</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30 print:border-slate-400 print:text-black">
                    MONTHLY DOSSIER
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                  Investor: <strong className="text-slate-200 print:text-black">{reportData.userName}</strong> • Generated: {reportData.generatedAt}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block print:text-slate-600">Financial Health Rating</span>
                <span className="text-2xl font-black text-cyan-300 print:text-blue-700">{reportData.healthScore}/100</span>
                <span className="text-xs font-bold text-slate-400 block print:text-slate-700">({reportData.healthStatus})</span>
              </div>
            </div>

            {/* Financial Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Income</span>
                <strong className="text-sm font-extrabold text-white print:text-black">{formatINR(reportData.monthlyIncome)}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Outflow</span>
                <strong className="text-sm font-extrabold text-rose-400 print:text-rose-700">{formatINR(reportData.totalExpenses)}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Surplus</span>
                <strong className="text-sm font-extrabold text-emerald-400 print:text-emerald-700">{formatINR(reportData.surplus)}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Savings Rate</span>
                <strong className="text-sm font-extrabold text-cyan-300 print:text-blue-700">{reportData.savingsRate}%</strong>
              </div>
            </div>

            {/* Anomalies / Risk Signals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
                Anomalies & Risk Signals
              </h4>
              <div className="space-y-2">
                {reportData.anomalies.map((anom, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2 print:border-slate-300 print:bg-slate-50 print:text-black"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{anom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Action Plan for Next Month */}
            <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-3 print:border-slate-300 print:bg-slate-50">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm print:text-blue-800">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>AI Action Plan for Next Month</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed print:text-black">
                {reportData.aiActionPlan}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
