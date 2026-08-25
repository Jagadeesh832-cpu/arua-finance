import { useAuth } from "@/helper/auth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/helper/formatters";
import { BarChart3, Plus, ArrowRight, PieChart as PieIcon, Tag, IndianRupee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ExpenseSummary = () => {
  const { LoggedInUserData } = useAuth();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    setExpenses(LoggedInUserData?.expenses || []);
  }, [LoggedInUserData]);

  const getCategoryColor = (category) => {
    const colors = {
      Food: "#10b981",
      Transportation: "#3b82f6",
      Entertainment: "#8b5cf6",
      Shopping: "#ec4899",
      Bills: "#ef4444",
      Healthcare: "#06b6d4",
      Education: "#f59e0b",
      Other: "#64748b"
    };
    return colors[category] || "#64748b";
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  const categorySummary = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (Number(item.amount) || 0);
    return acc;
  }, {});

  const chartData = Object.entries(categorySummary).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: getCategoryColor(category)
  }));

  return (
    <Card className="arua-card rounded-2xl animate-slide-up border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
            <PieIcon className="w-5 h-5 text-cyan-400" />
            <span>Spending Analytics (₹)</span>
          </CardTitle>
          <span className="text-xs font-bold text-rose-400 bg-rose-950/50 border border-rose-800/60 px-3 py-1 rounded-full">
            Total: {formatINR(totalExpenses)}
          </span>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Visual allocation of your recent rupee expenditures
        </CardDescription>
      </CardHeader>

      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-200 mb-1">No transactions recorded</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
              Add your recent grocery, utility, or shopping expenses to unlock AI budget telemetry.
            </p>
            <Link to="/expenses">
              <Button className="gradient-bg text-white hover:scale-105 transition-all text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add First Transaction
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Chart Area */}
            <div className="w-full h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b14" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatINR(value), "Amount"]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#f8fafc"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-2 justify-center pb-2">
              {chartData.map((cat, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span>{cat.name}:</span>
                  <span className="font-bold text-white">{formatINR(cat.value)}</span>
                </div>
              ))}
            </div>

            {/* Recent Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-blue-500/40 transition-all text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    ></div>
                    <div>
                      <p className="font-bold text-slate-200">{expense.description}</p>
                      <p className="text-[11px] text-slate-400">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-rose-400">
                    -{formatINR(expense.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/expenses">
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 rounded-xl border-slate-700 hover:border-slate-600"
                >
                  Manage All Rupee Expenses
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseSummary;
