import { useState, useEffect } from "react";
import { useAuth } from "@/helper/auth";
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
import { User, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Zap, IndianRupee } from "lucide-react";
import NotFound from "./NotFound";

const Profile = () => {
  const { LoggedInUserData, setLoggedInUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    annualIncome: "",
    age: 24,
    monthlyBudget: "",
    riskTolerance: "Medium"
  });

  useEffect(() => {
    if (LoggedInUserData) {
      setFormData({
        name: LoggedInUserData.name || "",
        age: LoggedInUserData.age || 24,
        annualIncome: LoggedInUserData.annualIncome || "",
        monthlyBudget: LoggedInUserData.monthlyBudget || "",
        riskTolerance: LoggedInUserData.riskTolerance || "Medium"
      });
    }
  }, [LoggedInUserData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedData = {
        ...LoggedInUserData,
        name: formData.name,
        annualIncome: Number(formData.annualIncome) || 0,
        age: Number(formData.age) || 24,
        monthlyBudget: Number(formData.monthlyBudget) || 0,
        riskTolerance: formData.riskTolerance || "Medium"
      };

      const result = await UpdateUserDataFunc(updatedData);

      setLoggedInUserData(result);

      toast({
        title: "Profile updated successfully!",
        description: "Your financial parameters and AI risk profile have been synced with Atlas.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        title: "Error saving profile",
        description: "Could not save your data to the cloud. Please try again.",
        variant: "destructive",
      });
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

          <Card className="arua-card rounded-2xl border-slate-800 shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center space-x-2 text-white">
                  <User className="w-5 h-5 text-cyan-400" />
                  <span>Investor Financial Identity</span>
                </CardTitle>
                <span className="text-xs text-slate-400 font-mono">{LoggedInUserData.email}</span>
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
                  className="w-full gradient-bg text-white font-bold rounded-xl py-3 shadow-lg shadow-blue-500/25 hover:scale-102 transition-all text-sm border border-blue-400/30"
                >
                  Save Profile & Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
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
