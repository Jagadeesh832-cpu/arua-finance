import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/helper/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(cleanEmail);
      if (res && res.success) {
        setSuccessData(res);
      } else {
        setError(res?.message || "Could not find an account with this email address.");
      }
    } catch (err) {
      setError("Network error requesting password reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Logo Brand Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Arua <span className="gradient-text">Finance</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 mt-1">Autonomous AI Wealth Intelligence</p>
          </div>

          <Card className="arua-card border-slate-800/80 bg-[#0c1222]/90 backdrop-blur-2xl shadow-2xl rounded-2xl animate-fade-in">
            <CardHeader className="pb-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Reset Account Password</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Enter your email address and we'll send you a secure link to reset your password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {successData ? (
                <div className="space-y-4 text-center py-2 animate-fade-in">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Reset Link Dispatched</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      We have sent instructions and a secure reset link to <strong className="text-white">{email}</strong>. Please check your inbox and spam folder.
                    </p>
                    {successData.resetUrl && (
                      <div className="mt-3 pt-3 border-t border-emerald-800/40 text-left">
                        <p className="text-[11px] font-bold text-cyan-300 mb-1">Development Quick Link:</p>
                        <a
                          href={successData.resetUrl}
                          className="text-[11px] text-cyan-400 hover:underline break-all font-mono"
                        >
                          {successData.resetUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  <Link to="/">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl mt-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                      Return to Homepage / Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Registered Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="investor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full gradient-bg hover:opacity-90 text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </Button>

                  <div className="pt-2 text-center">
                    <Link
                      to="/"
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
