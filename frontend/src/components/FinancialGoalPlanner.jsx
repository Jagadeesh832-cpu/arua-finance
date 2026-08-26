import React, { useState } from "react";
import { useAuth } from "@/helper/auth";
import { formatINR } from "@/helper/formatters";
import { getApiBaseUrl } from "@/helper/apiUrl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Shield,
  Car,
  Home,
  GraduationCap,
  Plane,
  Coins,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const GOAL_CATEGORIES = [
  { name: "Emergency Fund", icon: Shield, color: "text-amber-400 bg-amber-500/20 border-amber-500/30" },
  { name: "Buy a Car", icon: Car, color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  { name: "Buy a House", icon: Home, color: "text-purple-400 bg-purple-500/20 border-purple-500/30" },
  { name: "Education", icon: GraduationCap, color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30" },
  { name: "Travel", icon: Plane, color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" },
  { name: "Retirement", icon: Coins, color: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30" },
  { name: "Custom Goal", icon: Target, color: "text-pink-400 bg-pink-500/20 border-pink-500/30" }
];

export default function FinancialGoalPlanner() {
  const { LoggedInUserData, setLoggedInUserData } = useAuth();
  const goals = LoggedInUserData?.goals || [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Emergency Fund",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    monthlyContribution: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [contributeGoalId, setContributeGoalId] = useState(null);
  const [contributeAmount, setContributeAmount] = useState("");

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.targetAmount) {
      setError("Please provide a goal name and target amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = LoggedInUserData?.phoneNumber || LoggedInUserData?.email;
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/user/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          name: formData.name.trim(),
          category: formData.category,
          targetAmount: Number(formData.targetAmount),
          currentAmount: Number(formData.currentAmount) || 0,
          targetDate: formData.targetDate,
          monthlyContribution: Number(formData.monthlyContribution) || 0
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save goal in database.");
        return;
      }

      setLoggedInUserData(data.user);
      setShowAddForm(false);
      setFormData({
        name: "",
        category: "Emergency Fund",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
        monthlyContribution: ""
      });
    } catch (err) {
      console.error("Create goal error:", err);
      setError("Network error saving goal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const identifier = LoggedInUserData?.phoneNumber || LoggedInUserData?.email;
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/user/goals/${goalId}?identifier=${encodeURIComponent(identifier)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setLoggedInUserData(data.user);
      }
    } catch (err) {
      console.error("Delete goal error:", err);
    }
  };

  const handleAddContribution = async (goal) => {
    if (!contributeAmount || Number(contributeAmount) <= 0) return;
    try {
      const identifier = LoggedInUserData?.phoneNumber || LoggedInUserData?.email;
      const baseUrl = getApiBaseUrl();
      const newTotal = (Number(goal.currentAmount) || 0) + Number(contributeAmount);
      const res = await fetch(`${baseUrl}/api/user/goals/${goal.id || goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          currentAmount: newTotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setLoggedInUserData(data.user);
        setContributeGoalId(null);
        setContributeAmount("");
      }
    } catch (err) {
      console.error("Contribution update error:", err);
    }
  };

  const getCategoryMeta = (categoryName) => {
    return GOAL_CATEGORIES.find((c) => c.name === categoryName) || GOAL_CATEGORIES[6];
  };

  return (
    <Card className="arua-card rounded-3xl border-slate-800 shadow-2xl relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>MongoDB Milestone Tracker</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Financial Goal Planner</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Track major life milestones, automated SIP contributions, and timeline projections in ₹.
            </CardDescription>
          </div>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="gradient-bg text-white font-bold rounded-xl text-xs sm:text-sm px-4 py-2 border border-blue-400/30 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "Cancel" : "Add New Goal"}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add Goal Modal / Form */}
        {showAddForm && (
          <form onSubmit={handleCreateGoal} className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 animate-slide-up">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Create New Financial Milestone</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-slate-300">Goal Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Buy a Tesla / Dream Home Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 rounded-xl bg-slate-900 border border-slate-800 text-white px-3 text-xs focus:ring-blue-500"
                >
                  {GOAL_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Target Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 500000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                  className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Current Saved Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Target Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Planned Monthly Contribution (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white font-semibold"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="h-9 rounded-xl text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 gradient-bg text-white font-bold rounded-xl text-xs px-4"
              >
                {isSubmitting ? "Saving to MongoDB..." : "Save Goal"}
              </Button>
            </div>
          </form>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No Financial Goals Created Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Define your key life goals—such as an Emergency Reserve, Buying a Car, or Retirement—and let Arua track your progress automatically.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="gradient-bg text-white font-bold rounded-xl text-xs px-4 py-2 mt-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const meta = getCategoryMeta(goal.category);
              const Icon = meta.icon;
              const target = Number(goal.targetAmount) || 1;
              const current = Number(goal.currentAmount) || 0;
              const monthly = Number(goal.monthlyContribution) || 0;
              const progressPct = Math.min(100, Math.round((current / target) * 100));
              const remainingAmt = Math.max(0, target - current);

              // Timeline calculation
              let timelineText = "Ongoing";
              if (remainingAmt === 0) {
                timelineText = "🎉 Goal Achieved!";
              } else if (monthly > 0) {
                const months = Math.ceil(remainingAmt / monthly);
                const years = (months / 12).toFixed(1);
                timelineText = months >= 12 ? `~${years} years (${months} mos) at current SIP` : `~${months} month(s) at current SIP`;
              }

              return (
                <div
                  key={goal.id || goal._id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-md relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{goal.name}</h4>
                        <span className="text-[11px] text-slate-400 font-medium">{goal.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id || goal._id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Numbers */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-extrabold">{formatINR(current)}</span>
                      <span className="text-slate-400 font-semibold">{formatINR(target)}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPct >= 100
                            ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                            : "bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="text-cyan-300 font-bold">{progressPct}% Funded</span>
                      <span>{remainingAmt > 0 ? `${formatINR(remainingAmt)} remaining` : "Completed"}</span>
                    </div>
                  </div>

                  {/* Timeline Badge & Contribute Action */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{timelineText}</span>
                    </div>

                    {contributeGoalId === (goal.id || goal._id) ? (
                      <div className="flex items-center space-x-1.5">
                        <Input
                          type="number"
                          placeholder="+ ₹"
                          value={contributeAmount}
                          onChange={(e) => setContributeAmount(e.target.value)}
                          className="h-7 w-20 text-xs bg-slate-950 border-slate-700 text-white"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddContribution(goal)}
                          className="h-7 px-2.5 text-[11px] gradient-bg text-white font-bold rounded-lg"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setContributeGoalId(null)}
                          className="h-7 px-1.5 text-slate-400 hover:text-white"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setContributeGoalId(goal.id || goal._id)}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 self-start sm:self-auto"
                      >
                        + Add Funds (₹)
                      </button>
                    )}
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
