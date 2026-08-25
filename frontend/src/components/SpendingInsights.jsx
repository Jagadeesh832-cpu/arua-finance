import React from "react";
import { useAuth } from "@/helper/auth";
import { formatINR } from "@/helper/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ShoppingBag,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";

export default function SpendingInsights() {
  const { LoggedInUserData } = useAuth();
  const expenses = LoggedInUserData?.expenses || [];
  const monthlyBudget = Number(LoggedInUserData?.monthlyBudget) || 0;
  const annualIncome = Number(LoggedInUserData?.annualIncome) || 0;
  const monthlyIncome = annualIncome / 12;

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const budgetBurn = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // Group by category
  const categoryTotals = {};
  expenses.forEach((e) => {
    const cat = e.category || "General";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] || null;
  const topCategoryPct = totalSpent > 0 && topCategory ? Math.round((topCategory[1] / totalSpent) * 100) : 0;

  // Generate real data-backed insight alerts
  const insights = [];

  if (topCategory) {
    insights.push({
      type: "info",
      title: `Top Spending Category: ${topCategory[0]}`,
      description: `Your highest expense outflow is in ${topCategory[0]} at ${formatINR(topCategory[1])}, representing ${topCategoryPct}% of your total logged spending.`,
      icon: ShoppingBag,
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    });
  }

  if (budgetBurn >= 100) {
    insights.push({
      type: "danger",
      title: "Critical: Monthly Budget Exceeded",
      description: `You have exhausted 100% of your allocated monthly budget (${formatINR(monthlyBudget)}) by ${formatINR(totalSpent - monthlyBudget)}. Consider curbing discretionary lifestyle spends.`,
      icon: ShieldAlert,
      color: "bg-rose-500/20 text-rose-300 border-rose-500/30"
    });
  } else if (budgetBurn >= 80) {
    insights.push({
      type: "warning",
      title: `Budget Warning: ${budgetBurn.toFixed(0)}% Utilized`,
      description: `You have consumed ${budgetBurn.toFixed(0)}% of your monthly budget buffer (${formatINR(totalSpent)} of ${formatINR(monthlyBudget)}). ${formatINR(monthlyBudget - totalSpent)} remaining.`,
      icon: AlertTriangle,
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30"
    });
  } else if (monthlyBudget > 0) {
    insights.push({
      type: "success",
      title: "Strong Budget Discipline",
      description: `You are operating smoothly within your monthly budget ceiling with ${formatINR(monthlyBudget - totalSpent)} buffer available for savings or SIP investments.`,
      icon: CheckCircle2,
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    });
  }

  if (topCategoryPct >= 40 && topCategory) {
    insights.push({
      type: "warning",
      title: `Concentration Alert: ${topCategory[0]}`,
      description: `${topCategory[0]} accounts for over 40% of all expenses. Reducing this category by just 10% could free up ${formatINR(Math.round(topCategory[1] * 0.1))} each month.`,
      icon: Zap,
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    });
  }

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Expense Radar</span>
            </div>
            <CardTitle className="text-xl font-black text-white">
              Spending Insights & Automated Alerts
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Data-backed anomaly detection across your {expenses.length} logged transaction(s).
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {expenses.length === 0 ? (
          <div className="p-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No expenses logged yet. Add expenses in the <strong>Expense Tracker</strong> to unlock AI spending alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start space-x-3.5 transition-all shadow-sm ${insight.color}`}
                >
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 shrink-0">
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-extrabold text-white text-sm">{insight.title}</h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
