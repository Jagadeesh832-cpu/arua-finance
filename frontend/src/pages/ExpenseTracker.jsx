import { useState, useEffect } from "react";
import NotFound from "./NotFound";
import { useAuth } from "@/helper/auth";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SendMailFunc from "../helper/SendMailFunc";
import UpdateUserDataFunc from "../helper/UpdateUserDataFunc";
import { formatINR } from "@/helper/formatters";
import { Plus, Trash2, BarChart3, Calendar, IndianRupee, Sparkles, Tag, Receipt, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExpenseTracker = () => {
  const { LoggedInUserData, setLoggedInUserData } = useAuth();
  const { toast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    setExpenses(LoggedInUserData?.expenses || []);
  }, [LoggedInUserData]);

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Bills",
    "Healthcare",
    "Education",
    "Other"
  ];

  const addExpense = async (e) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.amount || !formData.category) {
      toast({
        title: "Incomplete details",
        description: "Please provide description, amount, and category.",
        variant: "destructive"
      });
      return;
    }

    const newExpense = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date
    };

    const updatedExpenses = [newExpense, ...expenses];
    const result = await UpdateUserDataFunc({
      email: LoggedInUserData.email,
      expenses: updatedExpenses
    });

    setLoggedInUserData(result);

    const annualIncome = result?.annualIncome || 0;
    const monthlyBudget = result?.monthlyBudget || 0;
    const newExpenses = result?.expenses || [];
    const totalExpenses = newExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    const monthlyBudgetPercentage = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

    if (monthlyBudgetPercentage > 80) {
      const mailPayload = {
        email: result.email,
        subject: "Arua Finance Budget Alert: You're nearing your monthly budget limit!",
        html: `
          <h2>⚠️ Arua Finance Budget Alert</h2>
          <p>Hi ${result.name || "User"},</p>
          <p>You have spent <strong>${monthlyBudgetPercentage.toFixed(1)}%</strong> of your planned monthly budget (${formatINR(monthlyBudget)}).</p>
          <p>Consider reviewing your discretionary expenses to maintain your savings targets.</p>
          <p>- Arua Finance AI Intelligence • Smarter Money. Powered by AI.</p>
        `,
        BccArr: []
      };

      SendMailFunc(mailPayload);
    }

    toast({
      title: "Expense logged!",
      description: `${formatINR(newExpense.amount)} for ${newExpense.description}`,
    });

    setFormData({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0]
    });
  };

  const deleteExpense = async (id) => {
    const updatedExpenses = expenses.filter((expense) => expense._id !== id);
    const result = await UpdateUserDataFunc({
      email: LoggedInUserData.email,
      expenses: updatedExpenses
    });

    setLoggedInUserData(result);

    toast({
      title: "Expense removed",
      description: "Transaction successfully deleted from your records.",
    });
  };

  const getCategoryBadgeClass = (category) => {
    const colors = {
      Food: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
      Transportation: "bg-blue-950/70 text-blue-300 border-blue-800/60",
      Entertainment: "bg-purple-950/70 text-purple-300 border-purple-800/60",
      Shopping: "bg-pink-950/70 text-pink-300 border-pink-800/60",
      Bills: "bg-rose-950/70 text-rose-300 border-rose-800/60",
      Healthcare: "bg-teal-950/70 text-teal-300 border-teal-800/60",
      Education: "bg-amber-950/70 text-amber-300 border-amber-800/60",
      Other: "bg-slate-900 text-slate-300 border-slate-700"
    };
    return colors[category] || "bg-slate-900 text-slate-300 border-slate-700";
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  if (!LoggedInUserData) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 relative selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rupee Expense Radar • Real-time Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Expense Tracker & Ledger (₹)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor, categorize, and control your daily Indian Rupee expenditures.
          </p>
        </div>

        {/* 3 Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
          <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This Month</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-rose-400">{formatINR(monthlyTotal)}</div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{monthlyExpenses.length} transaction(s) this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">All-Time Total</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-purple-300">{formatINR(totalExpenses)}</div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cumulative expenditure</p>
              </div>
            </CardContent>
          </Card>

          <Card className="arua-card arua-card-hover rounded-2xl border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white">{expenses.length}</div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Synced with MongoDB Atlas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Form + List */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Add Expense Form (2 columns) */}
          <Card className="lg:col-span-2 arua-card rounded-2xl animate-slide-up border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Log New Transaction (₹)</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Record your spending for intelligent budget tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addExpense} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs text-slate-300 font-semibold">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., Groceries at Supermarket / Swiggy"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs text-slate-300 font-semibold">
                      Amount (₹)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1500"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs text-slate-300 font-semibold">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs text-slate-300 font-semibold">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus:ring-blue-500 h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Select spending category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-xs sm:text-sm">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-bg text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-500/25 hover:scale-102 transition-all mt-2 border border-blue-400/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Expense (₹)
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Transaction Ledger (3 columns) */}
          <Card className="lg:col-span-3 arua-card rounded-2xl animate-slide-up border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span>Rupee Transaction Ledger</span>
                </CardTitle>
                <span className="text-xs font-bold text-slate-400">{expenses.length} records</span>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Detailed history of your logged expenditures in ₹
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {expenses.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                    <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-200 mb-1">No transaction records found</h3>
                    <p className="text-xs text-slate-400">
                      Use the form on the left to add your first expense.
                    </p>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-blue-500/40 transition-all text-xs group"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{expense.description}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                                expense.category
                              )}`}
                            >
                              {expense.category}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-rose-400 text-sm">
                          -{formatINR(expense.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpense(expense._id)}
                          className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 p-1.5 h-8 w-8 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;