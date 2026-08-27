import { useState, useEffect } from "react";
import NotFound from "./NotFound";
import { useAuth } from "@/helper/auth";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import UpdateUserDataFunc from "../helper/UpdateUserDataFunc";
import { formatINR } from "@/helper/formatters";
import {
  Plus,
  Trash2,
  Edit2,
  BarChart3,
  Calendar,
  IndianRupee,
  Receipt,
  Zap,
  Filter,
  Search,
  CreditCard,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ExpenseTracker = () => {
  const { LoggedInUserData, setLoggedInUserData } = useAuth();
  const { toast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Adding
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Food & Dining",
    paymentMethod: "UPI",
    date: new Date().toISOString().split("T")[0]
  });

  // Filter & Search States
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    amount: "",
    category: "",
    paymentMethod: "",
    date: ""
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setExpenses(LoggedInUserData?.expenses || []);
  }, [LoggedInUserData]);

  const categories = [
    "Food & Dining",
    "Rent & Housing",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Transport",
    "EMI & Loans",
    "Other"
  ];

  const paymentMethods = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Cash",
    "Other"
  ];

  const getCategoryBadgeClass = (category) => {
    const colors = {
      "Food & Dining": "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
      "Rent & Housing": "bg-blue-950/70 text-blue-300 border-blue-800/60",
      "Utilities": "bg-amber-950/70 text-amber-300 border-amber-800/60",
      "Entertainment": "bg-purple-950/70 text-purple-300 border-purple-800/60",
      "Healthcare": "bg-teal-950/70 text-teal-300 border-teal-800/60",
      "Shopping": "bg-pink-950/70 text-pink-300 border-pink-800/60",
      "Transport": "bg-cyan-950/70 text-cyan-300 border-cyan-800/60",
      "EMI & Loans": "bg-rose-950/70 text-rose-300 border-rose-800/60",
      "Other": "bg-slate-900 text-slate-300 border-slate-700"
    };
    return colors[category] || "bg-slate-900 text-slate-300 border-slate-700";
  };

  // Add Expense
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

    setIsSubmitting(true);
    try {
      const newExpense = {
        _id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        paymentMethod: formData.paymentMethod || "UPI",
        date: formData.date || new Date().toISOString()
      };

      const updatedExpenses = [newExpense, ...expenses];
      const identifier = LoggedInUserData.email || LoggedInUserData.phoneNumber;
      const result = await UpdateUserDataFunc({
        email: LoggedInUserData.email,
        phoneNumber: LoggedInUserData.phoneNumber,
        identifier,
        expenses: updatedExpenses
      });

      if (result) {
        setLoggedInUserData(result);
        setExpenses(result.expenses || updatedExpenses);
      }

      toast({
        title: "Expense logged!",
        description: `${formatINR(newExpense.amount)} for ${newExpense.description} recorded.`,
      });

      setFormData({
        description: "",
        amount: "",
        category: "Food & Dining",
        paymentMethod: "UPI",
        date: new Date().toISOString().split("T")[0]
      });
    } catch (err) {
      toast({
        title: "Error adding expense",
        description: err.message || "Failed to persist expense.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setEditFormData({
      description: expense.description || "",
      amount: expense.amount || "",
      category: expense.category || "Food & Dining",
      paymentMethod: expense.paymentMethod || "UPI",
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    });
    setIsEditModalOpen(true);
  };

  // Save Edited Expense
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;

    setIsSubmitting(true);
    try {
      const updatedExpenses = expenses.map((exp) => {
        if (exp._id === editingExpense._id || exp.id === editingExpense.id) {
          return {
            ...exp,
            description: editFormData.description.trim(),
            amount: parseFloat(editFormData.amount),
            category: editFormData.category,
            paymentMethod: editFormData.paymentMethod,
            date: editFormData.date
          };
        }
        return exp;
      });

      const identifier = LoggedInUserData.email || LoggedInUserData.phoneNumber;
      const result = await UpdateUserDataFunc({
        email: LoggedInUserData.email,
        phoneNumber: LoggedInUserData.phoneNumber,
        identifier,
        expenses: updatedExpenses
      });

      if (result) {
        setLoggedInUserData(result);
        setExpenses(result.expenses || updatedExpenses);
      }

      toast({
        title: "Expense updated",
        description: "Transaction record modified successfully.",
      });

      setIsEditModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const confirmDeleteExpense = (id) => {
    setDeletingExpenseId(id);
    setIsDeleteModalOpen(true);
  };

  // Perform Delete
  const handleDeleteExpense = async () => {
    if (!deletingExpenseId) return;

    setIsSubmitting(true);
    try {
      const updatedExpenses = expenses.filter(
        (exp) => exp._id !== deletingExpenseId && exp.id !== deletingExpenseId
      );

      const identifier = LoggedInUserData.email || LoggedInUserData.phoneNumber;
      const result = await UpdateUserDataFunc({
        email: LoggedInUserData.email,
        phoneNumber: LoggedInUserData.phoneNumber,
        identifier,
        expenses: updatedExpenses
      });

      if (result) {
        setLoggedInUserData(result);
        setExpenses(result.expenses || updatedExpenses);
      }

      toast({
        title: "Expense removed",
        description: "Transaction successfully deleted from your ledger.",
      });

      setIsDeleteModalOpen(false);
      setDeletingExpenseId(null);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics Calculations
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  // Filtered Expense List
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesPayment = paymentFilter === "all" || (expense.paymentMethod || "UPI") === paymentFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPayment && matchesSearch;
  });

  if (!LoggedInUserData) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 relative selection:bg-blue-600 selection:text-white">
      {/* Background Glows */}
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
            Monitor, categorize, and control your daily Indian Rupee expenditures with multi-channel payment tracking.
          </p>
        </div>

        {/* 3 Stats Cards */}
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

        {/* Main Grid: Form + Ledger */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Add Expense Form (2 cols) */}
          <Card className="lg:col-span-2 arua-card rounded-2xl animate-slide-up border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Log New Transaction (₹)</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Record your spending with category & payment channel
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
                    placeholder="e.g., Grocery Shopping / Swiggy / Rent"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs text-slate-300 font-semibold">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus:ring-blue-500 h-10 text-xs">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="paymentMethod" className="text-xs text-slate-300 font-semibold">
                      Payment Mode
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus:ring-blue-500 h-10 text-xs">
                        <SelectValue placeholder="Payment mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {paymentMethods.map((pm) => (
                          <SelectItem key={pm} value={pm} className="text-xs">
                            {pm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gradient-bg text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-500/25 hover:scale-102 transition-all mt-2 border border-blue-400/30 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Saving Expense...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Record Expense (₹)</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ledger (3 cols) */}
          <Card className="lg:col-span-3 arua-card rounded-2xl animate-slide-up border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span>Rupee Transaction Ledger</span>
                </CardTitle>
                <span className="text-xs font-bold text-slate-400">
                  Showing {filteredExpenses.length} of {expenses.length} records
                </span>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <Input
                    placeholder="Search by note..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-slate-950/80 border-slate-800 rounded-lg text-white"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs bg-slate-950/80 border-slate-800 rounded-lg text-slate-300">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="h-8 text-xs bg-slate-950/80 border-slate-800 rounded-lg text-slate-300">
                    <SelectValue placeholder="All Payment Modes" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="all" className="text-xs">All Modes</SelectItem>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm} value={pm} className="text-xs">{pm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                    <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-200 mb-1">No matching transactions found</h3>
                    <p className="text-xs text-slate-400">
                      {expenses.length === 0 ? "Log your first expense using the form." : "Try clearing filters to see all transactions."}
                    </p>
                  </div>
                ) : (
                  filteredExpenses.map((expense) => (
                    <div
                      key={expense._id || expense.id}
                      className="flex items-center justify-between p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-blue-500/40 transition-all text-xs group"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{expense.description}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                                expense.category
                              )}`}
                            >
                              {expense.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                              {expense.paymentMethod || "UPI"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-rose-400 text-sm">
                          -{formatINR(expense.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(expense)}
                          className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 p-1.5 h-8 w-8 rounded-lg transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDeleteExpense(expense._id || expense.id)}
                          className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 p-1.5 h-8 w-8 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Expense Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#0c1222] border-slate-800 text-slate-200 max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center space-x-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              <span>Edit Transaction</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update details for this rupee expenditure.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-300">Description</Label>
              <Input
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                required
                className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Amount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  required
                  className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Date</Label>
                <Input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  required
                  className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Category</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(val) => setEditFormData({ ...editFormData, category: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Payment Mode</Label>
                <Select
                  value={editFormData.paymentMethod}
                  onValueChange={(val) => setEditFormData({ ...editFormData, paymentMethod: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {paymentMethods.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2 flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-slate-800 text-slate-300 rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gradient-bg text-white font-bold rounded-xl text-xs h-9 shadow-md"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#0c1222] border-slate-800 text-slate-200 max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Confirm Delete</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 pt-1">
              Are you sure you want to delete this expense record? This action will immediately remove the transaction from your ledger and update your monthly totals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-slate-800 text-slate-300 rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteExpense}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs h-9 shadow-md"
            >
              {isSubmitting ? "Deleting..." : "Delete Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTracker;