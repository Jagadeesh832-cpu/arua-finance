import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/helper/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Lock, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, openAuthModal } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please use the complete link sent to your email.");
      return;
    }

    if (!password || password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(token, password, confirmPassword);
      if (res && res.success) {
        setIsSuccess(true);
      } else {
        setError(res?.message || "Failed to reset password. The link may have expired.");
      }
    } catch (err) {
      setError("Network error resetting password. Please try again.");
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
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Create New Password</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Choose a strong password to secure your Arua Finance wealth profile.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {isSuccess ? (
                <div className="space-y-4 text-center py-2 animate-fade-in">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Password Reset Complete</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      Your password has been successfully updated. You can now sign in with your new credentials.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      navigate("/");
                      openAuthModal("signin");
                    }}
                    className="w-full gradient-bg text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30"
                  >
                    Proceed to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>New Password (min 6 characters)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Confirm New Password</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !password || !confirmPassword}
                    className="w-full gradient-bg hover:opacity-90 text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Reset Password & Secure Account</span>
                      </>
                    )}
                  </Button>

                  <div className="pt-2 text-center">
                    <Link
                      to="/"
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Cancel and Return Home</span>
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

export default ResetPassword;
