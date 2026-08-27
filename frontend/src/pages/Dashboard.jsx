import { useEffect, useState } from "react";
import NotFound from "./NotFound";
import { useAuth } from "@/helper/auth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ExpenseSummary from "@/components/ExpenseSummary";
import AIRecommendations from "@/components/AIRecommendations";
import FinancialHealthScore from "@/components/FinancialHealthScore";
import SmartBudgetGenerator from "@/components/SmartBudgetGenerator";
import FinancialGoalPlanner from "@/components/FinancialGoalPlanner";
import SpendingInsights from "@/components/SpendingInsights";
import InvestmentSimulator from "@/components/InvestmentSimulator";
import EmergencyFundCalculator from "@/components/EmergencyFundCalculator";
import MonthlyFinancialReport from "@/components/MonthlyFinancialReport";
import { formatINR } from "@/helper/formatters";
import { calculateHealthScore } from "@/helper/healthScore";
import {
  TrendingUp,
  IndianRupee,
  Target,
  Bot,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Wallet,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Activity,
  Calculator,
  ReceiptText,
  PieChart,
  FileText,
  Sliders,
  Shield,
  ShieldAlert,
  BellRing,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { LoggedInUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("cockpit"); // "cockpit" | "health" | "budget_goals" | "simulators" | "report"

  if (!LoggedInUserData) return <NotFound />;

  const annualIncome = LoggedInUserData?.annualIncome || 0;
  const monthlyIncome = Math.round(annualIncome / 12);
  const monthlyBudget = LoggedInUserData?.monthlyBudget || 0;
  const expenses = LoggedInUserData?.expenses || [];
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const monthlyBudgetPercentage = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - totalExpenses;

  const health = calculateHealthScore(LoggedInUserData);

  const tabs = [
    { key: "cockpit", label: "Executive Cockpit", icon: Zap },
    { key: "health", label: `Health Score (${health.overallScore}/100)`, icon: Activity },
    { key: "budget_goals", label: "Budget & Goals", icon: Target },
    { key: "simulators", label: "Wealth Simulators", icon: TrendingUp },
    { key: "report", label: "Monthly AI Report", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 relative selection:bg-blue-600 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Welcome Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arua Finance • Smarter Money. Powered by AI.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, <span className="gradient-text">{LoggedInUserData?.name || "Investor"}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Autonomous wealth telemetry, real-time rupee expense insights, and Gemini AI Money Coach.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/expenses">
              <Button className="gradient-bg text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-105 transition-all text-xs sm:text-sm font-bold rounded-xl px-4 py-2 border border-blue-400/30">
                <Plus className="w-4 h-4 mr-1.5" />
                Log Expense (₹)
              </Button>
            </Link>
            <Link to="/calculate">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-purple-950/60 text-slate-200 border-blue-500/30 hover:border-cyan-400/50 hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center space-x-2 group hover:scale-102 transition-all px-3.5 py-2"
              >
                <ReceiptText className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-white group-hover:text-cyan-200">Tax Studio</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  FY 25–26
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex space-x-1.5 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-300" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE COCKPIT OVERVIEW                                         */}
        {/* ========================================================================= */}
        {activeTab === "cockpit" && (
          <div className="space-y-8 animate-fade-in">
            {/* Real-Time Spending Radar Alert Banner */}
            {monthlyBudget > 0 && monthlyBudgetPercentage >= 75 && (
              <div
                className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl ${
                  monthlyBudgetPercentage > 100
                    ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
                    : monthlyBudgetPercentage >= 90
                    ? "bg-amber-950/40 border-amber-800/80 text-amber-200"
                    : "bg-blue-950/40 border-blue-800/80 text-cyan-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      monthlyBudgetPercentage > 100
                        ? "bg-rose-900/60 text-rose-300 border border-rose-700"
                        : monthlyBudgetPercentage >= 90
                        ? "bg-amber-900/60 text-amber-300 border border-amber-700"
                        : "bg-blue-900/60 text-cyan-300 border border-blue-700"
                    }`}
                  >
                    {monthlyBudgetPercentage > 100 ? (
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    ) : monthlyBudgetPercentage >= 90 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <BellRing className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>
                        {monthlyBudgetPercentage > 100
                          ? "⚠️ Critical Alert: Monthly Budget Exceeded"
                          : monthlyBudgetPercentage >= 90
                          ? "⚠️ High Spending Velocity Warning"
                          : "Smart Spending Radar Notice"}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-black/40 border border-white/10">
                        {monthlyBudgetPercentage.toFixed(0)}% Limit Used
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {monthlyBudgetPercentage > 100
                        ? `You have spent ${formatINR(totalExpenses)} against your ${formatINR(monthlyBudget)} monthly limit (${formatINR(Math.abs(remainingBudget))} over budget).`
                        : `You have utilized ${monthlyBudgetPercentage.toFixed(1)}% of your planned monthly budget. Remaining allowance: ${formatINR(remainingBudget)}.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
                  <Link to="/expenses" className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto text-xs font-bold rounded-xl gradient-bg text-white shadow-md hover:scale-102 transition-all border border-blue-400/30"
                    >
                      Inspect Radar
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* 5-Column Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 animate-slide-up">
              {/* Card 1: Monthly Income */}
              <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly In-Hand</span>
                    <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-blue-500/20">
                      <IndianRupee className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-white">{formatINR(monthlyIncome)}</div>
                    <p className="text-[11px] text-cyan-400 font-semibold mt-0.5">{formatINR(annualIncome)}/yr total</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Total Spent */}
              <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-rose-400">{formatINR(totalExpenses)}</div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{expenses.length} transaction(s) logged</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Monthly Budget */}
              <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Target</span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-white">{formatINR(monthlyBudget)}</div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Allocated monthly ceiling</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Health Score */}
              <Card
                onClick={() => setActiveTab("health")}
                className="arua-card arua-card-hover rounded-2xl border-slate-800 cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health Score</span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-cyan-300 group-hover:text-cyan-200">
                      {health.overallScore}/100
                    </div>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">{health.status}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 5: Budget Burn */}
              <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Budget Burn</span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-purple-300">{monthlyBudgetPercentage.toFixed(1)}%</div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {remainingBudget >= 0 ? `${formatINR(remainingBudget)} left` : "Over budget"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Progress Meter */}
            <Card className="arua-card rounded-2xl animate-slide-up border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center space-x-2 text-white">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>Monthly Rupee Budget Telemetry</span>
                  </CardTitle>
                  <span className="text-xs font-bold text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                    {formatINR(totalExpenses)} / {formatINR(monthlyBudget)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      monthlyBudgetPercentage > 80
                        ? "bg-gradient-to-r from-amber-500 to-rose-500"
                        : monthlyBudgetPercentage > 50
                        ? "bg-gradient-to-r from-blue-500 to-amber-500"
                        : "bg-gradient-to-r from-cyan-400 to-blue-500"
                    }`}
                    style={{ width: `${Math.min(monthlyBudgetPercentage, 100)}%` }}
                  ></div>
                </div>

                {monthlyBudgetPercentage > 80 && (
                  <div className="flex items-center space-x-2 text-rose-300 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>
                      High consumption alert: You have reached {monthlyBudgetPercentage.toFixed(1)}% of your planned monthly budget limit.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending Insights & AI Recommendations Grid */}
            <div className="grid lg:grid-cols-2 gap-6 items-start">
              <SpendingInsights />
              <ExpenseSummary />
            </div>

            {/* AI Wealth Recommendations */}
            <AIRecommendations />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FINANCIAL HEALTH SCORE DEEP-DIVE                                   */}
        {/* ========================================================================= */}
        {activeTab === "health" && (
          <div className="space-y-8 animate-fade-in">
            <FinancialHealthScore onNavigateTab={setActiveTab} />
            <div className="grid lg:grid-cols-2 gap-6 items-start">
              <EmergencyFundCalculator />
              <SpendingInsights />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SMART BUDGET GENERATOR & GOALS                                     */}
        {/* ========================================================================= */}
        {activeTab === "budget_goals" && (
          <div className="space-y-8 animate-fade-in">
            <SmartBudgetGenerator />
            <FinancialGoalPlanner />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WEALTH SIMULATORS (INVESTMENTS & EMERGENCY)                        */}
        {/* ========================================================================= */}
        {activeTab === "simulators" && (
          <div className="space-y-8 animate-fade-in">
            <InvestmentSimulator />
            <EmergencyFundCalculator />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MONTHLY AI FINANCIAL REPORT                                        */}
        {/* ========================================================================= */}
        {activeTab === "report" && (
          <div className="space-y-8 animate-fade-in">
            <MonthlyFinancialReport />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
