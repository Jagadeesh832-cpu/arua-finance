import { useAuth } from "@/helper/auth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/helper/formatters";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Bot,
  BarChart3,
  Calculator,
  ReceiptText,
  PieChart,
  Lock,
  Zap,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  Cpu,
  Layers,
  Activity,
  Phone,
  KeyRound
} from "lucide-react";

const Index = () => {
  const { user, LoggedInUserData, FirstLoader, openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/15 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Floating Dark Glass Header */}
      <header className="py-3.5 px-6 backdrop-blur-xl bg-[#070b14]/80 border-b border-slate-800/80 flex justify-between items-center fixed top-0 w-full z-50 transition-all shadow-xl shadow-black/30">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Arua <span className="gradient-text">Finance</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-cyan-400 border border-cyan-500/30">
              AI • ₹
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/calculate"
            className="hidden md:inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-purple-950/70 hover:from-blue-900/90 hover:via-indigo-900/80 hover:to-purple-900/80 border border-blue-500/30 hover:border-cyan-400/50 shadow-md shadow-black/40 hover:shadow-cyan-500/15 transition-all duration-300 group hover:scale-102"
          >
            <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-blue-600 transition-colors">
              <ReceiptText className="w-3.5 h-3.5" />
            </div>
            <span className="text-white group-hover:text-cyan-200 transition-colors">Tax Studio</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/30 tracking-tight">
              FY 25–26
            </span>
          </Link>

          {user ? (
            <Link to="/dashboard">
              <Button className="gradient-bg text-white font-bold rounded-xl px-4 py-2 text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all border border-blue-400/30">
                Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => openAuthModal("signin")}
              className="gradient-bg text-white font-bold rounded-xl px-4 py-2 text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all border border-blue-400/30 flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
              <span>Sign In / Sign Up</span>
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-36 pb-20 px-6 max-w-7xl mx-auto text-center relative">
        {/* Announcement Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-8 animate-fade-in shadow-lg shadow-blue-950/40">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Smarter Money. Powered by AI. • Tailored for Indian Wealth</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6 animate-fade-in">
          Autonomous Wealth &{" "}
          <span className="gradient-text">Financial Intelligence</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
          Automate rupee expense tracking, unlock data-backed SIP & equity portfolio strategies with Google Gemini, and minimize income tax under the FY 2025-26 slabs.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
          {FirstLoader ? (
            <div className="bg-slate-800 w-36 h-12 rounded-xl animate-pulse"></div>
          ) : user ? (
            <Link to="/dashboard">
              <Button className="gradient-bg text-white px-8 py-6 rounded-xl text-base font-bold shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 transition-all border border-blue-400/30">
                Launch Arua Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => openAuthModal("signup")}
              className="gradient-bg text-white px-8 py-6 rounded-xl text-base font-bold shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 transition-all border border-blue-400/30 flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          )}

          <Link to="/calculate">
            <Button
              variant="outline"
              className="px-6 py-6 rounded-xl text-base font-bold text-slate-200 bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-purple-950/60 hover:from-blue-900/80 hover:to-indigo-900/80 border-blue-500/30 hover:border-cyan-400/50 shadow-lg shadow-black/40 hover:shadow-cyan-500/10 group hover:scale-105 transition-all flex items-center space-x-2.5"
            >
              <ReceiptText className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Tax Studio</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                FY 25–26
              </span>
            </Button>
          </Link>
        </div>

        {/* Interactive Floating Showcase Preview */}
        <div className="max-w-5xl mx-auto relative mt-4">
          <div className="arua-card rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative z-10 text-left">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs text-slate-500 font-mono ml-2">aruafinance.in/telemetry</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                AI Telemetry Active
              </span>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: AI Advisor */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900/80 to-slate-900/40 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Gemini AI Strategy</span>
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-base font-bold text-white mb-1">Diversified Growth Portfolio</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ₹25,000/mo SIP • 40% Nifty 50 Index • 30% Flexi-Cap • 20% ELSS • 10% Gold ETF
                </p>
                <div className="mt-3.5 flex items-center text-xs font-semibold text-cyan-400 bg-blue-950/60 p-2 rounded-lg border border-blue-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400 shrink-0" />
                  <span>Optimized for Medium Risk (14.2% CAGR est.)</span>
                </div>
              </div>

              {/* Card 2: Monthly Budget Radar */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Budget (₹)</span>
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">{formatINR(42600)}</div>
                <p className="text-xs text-slate-400 mt-1">Remaining from {formatINR(50000)} target (14.8% utilized)</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" style={{ width: "14.8%" }}></div>
                </div>
              </div>

              {/* Card 3: Tax Engine */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-slate-900/40 border border-purple-500/30 hover:border-purple-400/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Tax Optimization</span>
                  <Calculator className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-cyan-300">Save {formatINR(85800)}</div>
                <p className="text-xs text-slate-400 mt-1">Under FY 2025-26 New Regime with {formatINR(1200000)} Gross Salary</p>
                <div className="mt-3.5 inline-flex items-center text-xs font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40">
                  Recommended: New Tax Regime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-24 bg-[#080d19] border-y border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>Full-Stack Financial Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for smart, modern investors
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              All the tools you need to build wealth, track daily cashflow, and plan taxes in India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="arua-card arua-card-hover rounded-2xl overflow-hidden border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Gemini AI Investment Advisory</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Real-time asset allocation models tailored for your age, annual income (e.g. ₹5,00,000 to ₹50,00,000+), and risk appetite.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="arua-card arua-card-hover rounded-2xl overflow-hidden border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Rupee Expense Radar</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Log transactions instantly with category breakdowns (Food, Transit, Bills), monthly burn rates, and budget alerts.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="arua-card arua-card-hover rounded-2xl overflow-hidden border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
                  <ReceiptText className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-bold text-white">Tax Studio</h3>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                    FY 25–26
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Compare Old vs. New tax slabs, compute HRA exemptions, calculate standard deductions, and maximize take-home pay.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="arua-card arua-card-hover rounded-2xl overflow-hidden border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-5 shadow-lg shadow-pink-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">24/7 AI Financial Assistant</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Ask questions about mutual fund taxation, emergency funds, SIP compounding, and market trends anytime.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="arua-card arua-card-hover rounded-2xl overflow-hidden border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-teal-500/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Real SMS OTP Security</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Secured with 2Factor SMS OTP authentication and MongoDB Atlas cloud synchronization for total privacy.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="arua-card arua-card-hover rounded-2xl overflow-hidden border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Wealth Goal Roadmaps</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Model 1 to 10-year investment horizons for buying a home, retirement, or higher education with SIP calculators.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10 arua-card rounded-3xl p-10 sm:p-14 border border-blue-500/40 shadow-2xl arua-glow-blue overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Master your money with Arua Finance
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Smarter Money. Powered by AI. Join thousands of Indian users optimizing their savings and investments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="gradient-bg text-white px-8 py-6 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/30 border border-blue-400/30">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => openAuthModal("signup")}
                className="gradient-bg text-white px-8 py-6 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/30 border border-blue-400/30 flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <span>Get Started with Arua</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            )}
            <Link to="/calculate">
              <Button variant="outline" className="text-slate-200 bg-gradient-to-r from-blue-950/70 to-purple-950/70 hover:from-blue-900/90 hover:to-indigo-900/90 border-blue-500/30 hover:border-cyan-400/50 px-6 py-6 rounded-xl font-bold flex items-center space-x-2 group hover:scale-105 transition-all">
                <ReceiptText className="w-4 h-4 text-cyan-400" />
                <span>Tax Studio</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  FY 25–26
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-400 text-xs sm:text-sm border-t border-slate-800/80 bg-[#060911]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Arua Finance</span>
            <span className="text-slate-500">— Smarter Money. Powered by AI.</span>
          </div>
          <p>&copy; 2026 Arua Finance. Built for Indian Financial Empowerment.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
