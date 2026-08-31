import { useState, useEffect } from "react";
import { useAuth } from "@/helper/auth";
import { useNotifications } from "@/helper/notificationContext";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UpdateUserDataFunc from "../helper/UpdateUserDataFunc";
import { formatINR } from "@/helper/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  IndianRupee,
  Lock,
  Eye,
  EyeOff,
  Bell,
  BellRing,
  Smartphone,
  Send,
  Sliders,
  ShieldAlert,
  Loader2,
  KeyRound,
  Check,
  AlertTriangle,
  Radio
} from "lucide-react";
import NotFound from "./NotFound";

const Profile = () => {
  const { LoggedInUserData, setLoggedInUserData, changePassword } = useAuth();
  const {
    preferences: notifPrefs,
    updatePreferences: saveNotifPrefs,
    requestPushPermission,
    pushPermissionStatus,
    sendTestNotification
  } = useNotifications();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    annualIncome: "",
    age: 24,
    monthlyBudget: "",
    riskTolerance: "Medium"
  });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Notification Preferences State
  const [prefState, setPrefState] = useState({
    inAppAlerts: true,
    pushAlerts: false,
    smsAlerts: false,
    smsBudgetAlerts: true,
    smsDailyAlerts: true,
    smsUnusualAlerts: true,
    emailAlerts: true,
    emailSecurityAlerts: true,
    emailBudgetAlerts: false,
    emailMonthlyReportAlerts: false,
    emailAiRecommendationAlerts: false,
    budgetThresholdAlerts: true,
    budgetExceededAlerts: true,
    categoryBudgetAlerts: true,
    unusualSpendingAlerts: true,
    dailySpendingAlerts: true,
    goalMilestoneAlerts: true,
    monthlyReportAlerts: true,
    aiRecommendationAlerts: true,
    budgetThresholds: [50, 75, 90, 100]
  });

  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (LoggedInUserData) {
      setFormData({
        name: LoggedInUserData.name || "",
        age: LoggedInUserData.age || 24,
        annualIncome: LoggedInUserData.annualIncome || "",
        monthlyBudget: LoggedInUserData.monthlyBudget || "",
        riskTolerance: LoggedInUserData.riskTolerance || "Medium"
      });

      if (LoggedInUserData.notificationPreferences) {
        setPrefState(prev => ({
          ...prev,
          ...LoggedInUserData.notificationPreferences
        }));
      }
    }
  }, [LoggedInUserData]);

  useEffect(() => {
    if (notifPrefs) {
      setPrefState(prev => ({
        ...prev,
        ...notifPrefs
      }));
    }
  }, [notifPrefs]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

    try {
      const updatedData = {
        ...LoggedInUserData,
        name: formData.name.trim(),
        annualIncome: Number(formData.annualIncome) || 0,
        age: Number(formData.age) || 24,
        monthlyBudget: Number(formData.monthlyBudget) || 0,
        riskTolerance: formData.riskTolerance || "Medium"
      };

      const result = await UpdateUserDataFunc(updatedData);

      if (result) {
        setLoggedInUserData(result);
      }

      toast({
        title: "Profile calibrated successfully!",
        description: "Your financial parameters and AI risk profile are synchronized with Atlas."
      });
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        title: "Error saving profile",
        description: "Could not save your data to the cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleTogglePref = (key) => {
    setPrefState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleThreshold = (num) => {
    setPrefState(prev => {
      const current = prev.budgetThresholds || [50, 75, 90, 100];
      let updatedList = [];
      if (current.includes(num)) {
        updatedList = current.filter(n => n !== num);
      } else {
        updatedList = [...current, num].sort((a, b) => a - b);
      }
      return {
        ...prev,
        budgetThresholds: updatedList
      };
    });
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      await saveNotifPrefs(prefState);
      if (LoggedInUserData) {
        setLoggedInUserData({
          ...LoggedInUserData,
          notificationPreferences: prefState
        });
      }
      toast({
        title: "Alert Preferences Saved",
        description: "Your SMS, Email, and in-app notification preferences are now active."
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handlePushToggle = async () => {
    if (!prefState.pushAlerts) {
      const granted = await requestPushPermission();
      if (granted) {
        setPrefState(prev => ({ ...prev, pushAlerts: true }));
      }
    } else {
      setPrefState(prev => ({ ...prev, pushAlerts: false }));
      await saveNotifPrefs({ ...prefState, pushAlerts: false });
    }
  };

  const handleTestAlert = async () => {
    setIsTestingNotif(true);
    try {
      await sendTestNotification();
    } finally {
      setIsTestingNotif(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password.",
        variant: "destructive"
      });
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast({
        title: "Weak password",
        description: "New password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      if (res && res.success) {
        toast({
          title: "Password updated!",
          description: "Your account security credentials were updated successfully.",
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast({
          title: "Failed to update password",
          description: res?.message || "Please check your current password.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error updating password",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!LoggedInUserData) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-16 relative selection:bg-blue-600 selection:text-white">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-8">
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-cyan-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arua Finance Investor Calibration • Smarter Money. Powered by AI.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Personalize Your AI Advisory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Your profile parameters power accurate Indian tax calculations (FY 25-26) and rupee portfolio allocations.
            </p>
          </div>

          {/* Profile Details Card */}
          <Card className="arua-card rounded-2xl border-slate-800 shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
                  <User className="w-5 h-5 text-cyan-400" />
                  <span>Investor Financial Identity</span>
                </CardTitle>
                <span className="text-xs text-slate-400 font-mono">
                  {LoggedInUserData.email || LoggedInUserData.phoneNumber}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-slate-300 font-semibold">
                    Full Legal Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isSubmittingProfile}
                    className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-xs text-slate-300 font-semibold">
                      Age (Years)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="24"
                      value={formData.age}
                      onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                      required
                      disabled={isSubmittingProfile}
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="riskTolerance" className="text-xs text-slate-300 font-semibold">
                      Risk Profile
                    </Label>
                    <Select
                      value={formData.riskTolerance}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, riskTolerance: val }))}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus:ring-blue-500 h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select risk profile" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="Low" className="text-xs sm:text-sm">Low (Capital Preservation)</SelectItem>
                        <SelectItem value="Medium" className="text-xs sm:text-sm">Medium (Balanced Growth)</SelectItem>
                        <SelectItem value="High" className="text-xs sm:text-sm">High (Aggressive Wealth)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="annualIncome" className="text-xs text-slate-300 font-semibold">
                      Annual Gross Income (₹)
                    </Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      placeholder="e.g., 800000"
                      value={formData.annualIncome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, annualIncome: e.target.value }))}
                      required
                      disabled={isSubmittingProfile}
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="monthlyBudget" className="text-xs text-slate-300 font-semibold">
                      Target Monthly Budget (₹)
                    </Label>
                    <Input
                      id="monthlyBudget"
                      type="number"
                      placeholder="e.g., 30000"
                      value={formData.monthlyBudget}
                      onChange={(e) => setFormData((prev) => ({ ...prev, monthlyBudget: e.target.value }))}
                      required
                      disabled={isSubmittingProfile}
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white focus-visible:ring-blue-500 h-10"
                    />
                  </div>
                </div>

                {/* Security Assurance */}
                <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-start space-x-3 text-xs">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300">Encrypted Cloud Synchronization</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Your financial parameters are securely encrypted in MongoDB Atlas and used exclusively for your Arua AI analysis.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="w-full gradient-bg text-white font-bold rounded-xl py-3 shadow-lg shadow-blue-500/25 hover:scale-102 transition-all text-sm border border-blue-400/30 flex items-center justify-center space-x-2"
                >
                  {isSubmittingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Saving Calibration...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Profile Settings</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 2. REAL-TIME SMART SPENDING ALERTS & NOTIFICATIONS CARD */}
          <Card id="notifications" className="arua-card rounded-2xl border-slate-800 shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center space-x-2 text-white">
                  <BellRing className="w-5 h-5 text-cyan-400" />
                  <span>Real-Time Smart Spending Alerts & Notifications</span>
                </CardTitle>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  Telemetry Active
                </span>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Configure real-time budget threshold warnings, SMS spending alerts, browser push notifications, and anomaly detection.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* ======================================================== */}
              {/* SECTION A: SMS SPENDING ALERTS (+91)                     */}
              {/* ======================================================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>A. SMS Alerts (Transactional SMS via 2Factor)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {LoggedInUserData?.phoneNumber ? LoggedInUserData.phoneNumber : "No mobile registered"}
                  </span>
                </div>

                {/* Master SMS Switch */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-start justify-between space-x-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 font-bold text-white text-xs">
                      <span>SMS Alerts Master Switch</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        prefState.smsAlerts ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                      }`}>
                        {prefState.smsAlerts ? "ON" : "OFF"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enable or disable all real SMS spending alerts delivered to your phone.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefState.smsAlerts === true}
                    onChange={() => handleTogglePref("smsAlerts")}
                    disabled={!LoggedInUserData?.phoneNumber}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer mt-0.5 disabled:opacity-40"
                  />
                </div>

                {/* Granular SMS Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.smsAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Budget Alerts</span>
                      <input
                        type="checkbox"
                        checked={prefState.smsBudgetAlerts !== false}
                        onChange={() => handleTogglePref("smsBudgetAlerts")}
                        disabled={!prefState.smsAlerts}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      50%, 75%, 90%, 100%, and over-budget threshold SMS.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.smsAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Daily Spending</span>
                      <input
                        type="checkbox"
                        checked={prefState.smsDailyAlerts !== false}
                        onChange={() => handleTogglePref("smsDailyAlerts")}
                        disabled={!prefState.smsAlerts}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      1 summary SMS per day when spending crosses meaningful amount.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.smsAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Unusual Spending</span>
                      <input
                        type="checkbox"
                        checked={prefState.smsUnusualAlerts !== false}
                        onChange={() => handleTogglePref("smsUnusualAlerts")}
                        disabled={!prefState.smsAlerts}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Statistically irregular single expenses vs history.
                    </p>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION B: EMAIL ALERTS & REPORTS                        */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-800/70">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>B. Email Alerts (Nodemailer Service)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {LoggedInUserData?.email ? LoggedInUserData.email : "No email registered"}
                  </span>
                </div>

                {/* Master Email Switch */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-start justify-between space-x-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 font-bold text-white text-xs">
                      <span>Email Alerts Master Switch</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        prefState.emailAlerts ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-slate-800 text-slate-400"
                      }`}>
                        {prefState.emailAlerts ? "ON" : "OFF"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enable or disable automated email digests and advisories.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefState.emailAlerts !== false}
                    onChange={() => handleTogglePref("emailAlerts")}
                    className="w-4 h-4 accent-cyan-600 rounded cursor-pointer mt-0.5"
                  />
                </div>

                {/* Granular Email Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.emailAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Security Emails</span>
                      <input
                        type="checkbox"
                        checked={prefState.emailSecurityAlerts !== false}
                        onChange={() => handleTogglePref("emailSecurityAlerts")}
                        disabled={!prefState.emailAlerts}
                        className="w-3.5 h-3.5 accent-cyan-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Password reset links and important account security notices.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.emailAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Budget Emails</span>
                      <input
                        type="checkbox"
                        checked={prefState.emailBudgetAlerts === true}
                        onChange={() => handleTogglePref("emailBudgetAlerts")}
                        disabled={!prefState.emailAlerts}
                        className="w-3.5 h-3.5 accent-cyan-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Detailed email dossiers when spending crosses critical limit.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.emailAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Monthly Report Emails</span>
                      <input
                        type="checkbox"
                        checked={prefState.emailMonthlyReportAlerts === true}
                        onChange={() => handleTogglePref("emailMonthlyReportAlerts")}
                        disabled={!prefState.emailAlerts}
                        className="w-3.5 h-3.5 accent-cyan-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Automated end-of-month financial health executive summaries.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    prefState.emailAlerts ? "bg-slate-950/60 border-slate-800/90" : "bg-slate-950/30 border-slate-900 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">AI Recommendations</span>
                      <input
                        type="checkbox"
                        checked={prefState.emailAiRecommendationAlerts === true}
                        onChange={() => handleTogglePref("emailAiRecommendationAlerts")}
                        disabled={!prefState.emailAlerts}
                        className="w-3.5 h-3.5 accent-cyan-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Personalized tax-saving (80C) and portfolio optimization tips.
                    </p>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION C: SPENDING TRIGGERS & THRESHOLDS                */}
              {/* ======================================================== */}
              <div className="pt-3 border-t border-slate-800/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>C. Budget Threshold Checkpoints</span>
                </h4>

                {/* Threshold Checkpoint Pills */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Select Active Spending Limit Alerts:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Dispatches once per month (Strict duplicate prevention)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[50, 75, 90, 100].map((num) => {
                      const isSelected = (prefState.budgetThresholds || [50, 75, 90, 100]).includes(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleToggleThreshold(num)}
                          className={`py-2 px-2 rounded-xl text-xs font-black transition-all border text-center ${
                            isSelected
                              ? num >= 100
                                ? "bg-rose-950/70 text-rose-300 border-rose-600/60 shadow-xs"
                                : num >= 90
                                ? "bg-amber-950/70 text-amber-300 border-amber-600/60 shadow-xs"
                                : "bg-blue-950/70 text-cyan-300 border-blue-500/60 shadow-xs"
                              : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                          }`}
                        >
                          {num}% Limit
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* In-App Notifications Ledger */}
                <div className="text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 flex items-start justify-between space-x-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-200">In-App Notification Ledger</span>
                      <p className="text-[10px] text-slate-400">
                        Cockpit alerts, ledger history, and financial anomaly banners.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefState.inAppAlerts !== false}
                      onChange={() => handleTogglePref("inAppAlerts")}
                      className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer mt-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={isSavingPrefs}
                  className="flex-1 gradient-bg text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-500/25 hover:scale-102 transition-all text-xs border border-blue-400/30 flex items-center justify-center space-x-2"
                >
                  {isSavingPrefs ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                      <span>Saving Alert Settings...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Notification Preferences</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestAlert}
                  disabled={isTestingNotif}
                  className="border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl text-xs py-2.5 flex items-center justify-center space-x-2"
                >
                  {isTestingNotif ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                  ) : (
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>Dispatch Test Alert</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="arua-card rounded-2xl border-slate-800 shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-800/80">
              <CardTitle className="text-base font-bold flex items-center space-x-2 text-white">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <span>Security & Password Management</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Update your account password to maintain maximum account security.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Current Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    disabled={isChangingPassword}
                    className="rounded-xl bg-slate-950/70 border-slate-800 text-white h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300">New Password (min 6 chars)</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      disabled={isChangingPassword}
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300">Confirm New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      disabled={isChangingPassword}
                      className="rounded-xl bg-slate-950/70 border-slate-800 text-white h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                  </button>

                  <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                    Forgot Current Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                  className="w-full gradient-bg text-white font-bold rounded-xl py-2.5 shadow-lg shadow-blue-500/25 hover:scale-102 transition-all text-xs border border-blue-400/30 flex items-center justify-center space-x-2 mt-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Account Password</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
