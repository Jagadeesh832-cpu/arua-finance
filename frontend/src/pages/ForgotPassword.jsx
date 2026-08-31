import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/helper/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";
import {
  Zap,
  Mail,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    forgotPasswordEmailOtp,
    verifyForgotPasswordEmailOtp,
    forgotPasswordPhone,
    verifyForgotPasswordPhoneOtp,
    resetPassword,
    openAuthModal
  } = useAuth();

  // Recovery Method: "email" | "phone"
  const [activeMethod, setActiveMethod] = useState("email");

  // Email Flow States: "input" | "otp_password" | "success"
  const [emailStep, setEmailStep] = useState("input");
  const [email, setEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailNewPassword, setEmailNewPassword] = useState("");
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");
  const [showEmailNewPassword, setShowEmailNewPassword] = useState(false);
  const [showEmailConfirmPassword, setShowEmailConfirmPassword] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);

  // Phone Flow States: "input" | "otp_password" | "success"
  const [phoneStep, setPhoneStep] = useState("input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneSessionId, setPhoneSessionId] = useState(null);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneNewPassword, setPhoneNewPassword] = useState("");
  const [phoneConfirmPassword, setPhoneConfirmPassword] = useState("");
  const [showPhoneNewPassword, setShowPhoneNewPassword] = useState(false);
  const [showPhoneConfirmPassword, setShowPhoneConfirmPassword] = useState(false);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);
  const [phoneResendCooldown, setPhoneResendCooldown] = useState(0);

  // Global Error
  const [error, setError] = useState("");

  // Handle Email OTP Request (Step 1)
  const handleEmailRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email format.");
      return;
    }

    setIsEmailSubmitting(true);
    try {
      const res = await forgotPasswordEmailOtp(cleanEmail);
      if (res && res.success) {
        setEmailStep("otp_password");
        setEmailResendCooldown(30);
      } else {
        setError(res?.message || "No account found with this email address.");
      }
    } catch (err) {
      setError("Network error requesting email verification code. Please try again.");
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Handle Email Resend OTP
  const handleResendEmailOtp = async () => {
    if (emailResendCooldown > 0 || isEmailSubmitting) return;
    setError("");
    setIsEmailSubmitting(true);
    try {
      const res = await forgotPasswordEmailOtp(email.trim());
      if (res && res.success) {
        setEmailResendCooldown(30);
      } else {
        setError(res?.message || "Failed to resend email OTP.");
      }
    } catch (err) {
      setError("Network error resending email OTP.");
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Handle Email OTP Verification & Password Reset (Step 2)
  const handleEmailVerifyAndReset = async (e) => {
    e.preventDefault();
    setError("");

    const cleanOtp = emailOtpCode.trim();
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit email verification code.");
      return;
    }

    if (!emailNewPassword || emailNewPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (emailNewPassword !== emailConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsEmailSubmitting(true);
    try {
      const cleanEmail = email.trim();
      const verifyRes = await verifyForgotPasswordEmailOtp({
        email: cleanEmail,
        otp: cleanOtp
      });

      if (!verifyRes || !verifyRes.success || !verifyRes.resetToken) {
        setError(verifyRes?.message || "Invalid or expired OTP. Please check the code sent to your email.");
        setIsEmailSubmitting(false);
        return;
      }

      // Reset password using the verified session token
      const resetRes = await resetPassword(verifyRes.resetToken, emailNewPassword, emailConfirmPassword);
      if (resetRes && resetRes.success) {
        setEmailStep("success");
      } else {
        setError(resetRes?.message || "Failed to update password. Please try again.");
      }
    } catch (err) {
      setError("Network error resetting password. Please try again.");
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Handle Phone OTP Request (Step 1)
  const handlePhoneRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (cleanDigits.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsPhoneSubmitting(true);
    try {
      const res = await forgotPasswordPhone(`+91${cleanDigits}`);
      if (res && res.success) {
        setPhoneSessionId(res.sessionId);
        setMaskedPhone(res.maskedPhone || `+91 ${cleanDigits}`);
        setPhoneStep("otp_password");
        setPhoneResendCooldown(30);
      } else {
        setError(res?.message || "No account found with this mobile number.");
      }
    } catch (err) {
      setError("Network error requesting phone OTP. Please try again.");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  // Handle Phone Resend OTP
  const handleResendPhoneOtp = async () => {
    if (phoneResendCooldown > 0 || isPhoneSubmitting) return;
    setError("");
    setIsPhoneSubmitting(true);
    try {
      const cleanDigits = phoneNumber.replace(/\D/g, "");
      const res = await forgotPasswordPhone(`+91${cleanDigits}`);
      if (res && res.success) {
        setPhoneSessionId(res.sessionId);
        setPhoneResendCooldown(30);
      } else {
        setError(res?.message || "Failed to resend SMS OTP.");
      }
    } catch (err) {
      setError("Network error resending SMS OTP.");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  // Handle Phone OTP Verification & Password Reset (Step 2)
  const handlePhoneVerifyAndReset = async (e) => {
    e.preventDefault();
    setError("");

    const cleanOtp = phoneOtpCode.trim();
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!phoneNewPassword || phoneNewPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (phoneNewPassword !== phoneConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPhoneSubmitting(true);
    try {
      const cleanDigits = phoneNumber.replace(/\D/g, "");
      const verifyRes = await verifyForgotPasswordPhoneOtp({
        phoneNumber: `+91${cleanDigits}`,
        sessionId: phoneSessionId,
        otp: cleanOtp
      });

      if (!verifyRes || !verifyRes.success || !verifyRes.resetToken) {
        setError(verifyRes?.message || "Invalid or expired OTP. Please check your SMS code.");
        setIsPhoneSubmitting(false);
        return;
      }

      // Reset password using the verified session token
      const resetRes = await resetPassword(verifyRes.resetToken, phoneNewPassword, phoneConfirmPassword);
      if (resetRes && resetRes.success) {
        setPhoneStep("success");
      } else {
        setError(resetRes?.message || "Failed to update password. Please try again.");
      }
    } catch (err) {
      setError("Network error resetting password. Please try again.");
    } finally {
      setIsPhoneSubmitting(false);
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
                Choose your preferred password recovery method below.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Method Selector Tabs */}
              {phoneStep !== "success" && !emailSuccess && (
                <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-4 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMethod("email");
                      setError("");
                    }}
                    className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      activeMethod === "email"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reset via Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMethod("phone");
                      setError("");
                    }}
                    className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      activeMethod === "phone"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Reset via Phone OTP</span>
                  </button>
                </div>
              )}

              {/* Error Message Banner */}
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* METHOD A: EMAIL OTP PASSWORD RESET                       */}
              {/* ======================================================== */}
              {activeMethod === "email" && (
                <>
                  {emailStep === "input" && (
                    <form onSubmit={handleEmailRequestOtp} className="space-y-4">
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
                          disabled={isEmailSubmitting}
                          required
                          className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isEmailSubmitting || !email.trim()}
                        className="w-full gradient-bg hover:opacity-90 text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center space-x-2"
                      >
                        {isEmailSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                            <span>Sending Email OTP...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>Send Email Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
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

                  {emailStep === "otp_password" && (
                    <form onSubmit={handleEmailVerifyAndReset} className="space-y-4 animate-fade-in">
                      <div className="text-center pb-2">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold mb-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Email OTP Verification</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailStep("input");
                            setError("");
                          }}
                          className="text-[11px] text-cyan-400 hover:underline mt-0.5"
                        >
                          Change Email Address
                        </button>
                      </div>

                      {/* 6-Digit Email OTP Box */}
                      <div className="flex flex-col items-center justify-center space-y-2 py-1">
                        <InputOTP
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(val) => {
                            setEmailOtpCode(val);
                            if (error) setError("");
                          }}
                          disabled={isEmailSubmitting}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={1} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={2} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                          </InputOTPGroup>
                          <InputOTPSeparator className="text-slate-600 font-bold mx-0.5" />
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={3} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={4} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={5} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      {/* New Password Inputs */}
                      <div className="space-y-3 pt-2 text-left">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-300">New Password</Label>
                          <div className="relative">
                            <Input
                              type={showEmailNewPassword ? "text" : "password"}
                              placeholder="Minimum 6 characters"
                              value={emailNewPassword}
                              onChange={(e) => setEmailNewPassword(e.target.value)}
                              required
                              disabled={isEmailSubmitting}
                              className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEmailNewPassword(!showEmailNewPassword)}
                              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                            >
                              {showEmailNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-300">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              type={showEmailConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter new password"
                              value={emailConfirmPassword}
                              onChange={(e) => setEmailConfirmPassword(e.target.value)}
                              required
                              disabled={isEmailSubmitting}
                              className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEmailConfirmPassword(!showEmailConfirmPassword)}
                              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                            >
                              {showEmailConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isEmailSubmitting || emailOtpCode.length !== 6 || !emailNewPassword || !emailConfirmPassword}
                        className="w-full gradient-bg hover:opacity-90 text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center space-x-2 mt-2"
                      >
                        {isEmailSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify Email OTP & Reset Password</span>
                          </>
                        )}
                      </Button>

                      {/* Resend Email OTP */}
                      <div className="text-center text-xs text-slate-400 pt-1">
                        {emailResendCooldown > 0 ? (
                          <span>
                            Resend Email OTP in <strong className="text-cyan-300">{emailResendCooldown}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendEmailOtp}
                            disabled={isEmailSubmitting}
                            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-all"
                          >
                            Didn't receive email? Resend code
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {emailStep === "success" && (
                    <div className="space-y-4 text-center py-2 animate-fade-in">
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Password Reset Complete</span>
                        </div>
                        <p className="leading-relaxed text-slate-300">
                          Your account password has been updated. You can now sign in using your new password.
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => {
                          navigate("/");
                          setTimeout(() => {
                            openAuthModal("signin");
                          }, 150);
                        }}
                        className="w-full gradient-bg text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30"
                      >
                        <span>Sign In Now</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* METHOD B: MOBILE NUMBER OTP PASSWORD RESET               */}
              {/* ======================================================== */}
              {activeMethod === "phone" && (
                <>
                  {phoneStep === "input" && (
                    <form onSubmit={handlePhoneRequestOtp} className="space-y-4">
                      <div className="space-y-1.5 text-left">
                        <Label htmlFor="phone" className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Registered Mobile Number</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold shrink-0">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="98765 43210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            disabled={isPhoneSubmitting}
                            required
                            className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10 font-semibold tracking-wide flex-1"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isPhoneSubmitting || phoneNumber.replace(/\D/g, "").length !== 10}
                        className="w-full gradient-bg hover:opacity-90 text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center space-x-2"
                      >
                        {isPhoneSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                            <span>Sending SMS OTP...</span>
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4" />
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
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

                  {phoneStep === "otp_password" && (
                    <form onSubmit={handlePhoneVerifyAndReset} className="space-y-4 animate-fade-in">
                      <div className="text-center pb-2">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold mb-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>SMS Verification</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Enter the 6-digit OTP sent to <strong className="text-white">{maskedPhone}</strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep("input");
                            setError("");
                          }}
                          className="text-[11px] text-cyan-400 hover:underline mt-0.5"
                        >
                          Change Mobile Number
                        </button>
                      </div>

                      {/* 6-Digit OTP Box */}
                      <div className="flex flex-col items-center justify-center space-y-2 py-1">
                        <InputOTP
                          maxLength={6}
                          value={otpCode}
                          onChange={(val) => {
                            setOtpCode(val);
                            if (error) setError("");
                          }}
                          disabled={isPhoneSubmitting}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={1} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={2} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                          </InputOTPGroup>
                          <InputOTPSeparator className="text-slate-600 font-bold mx-0.5" />
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={3} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={4} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                            <InputOTPSlot index={5} className="w-9 sm:w-10 h-11 text-base font-bold rounded-lg bg-slate-950 border-slate-800 text-white" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      {/* New Password Inputs */}
                      <div className="space-y-3 pt-2 text-left">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-300">New Password</Label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Minimum 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                              disabled={isPhoneSubmitting}
                              className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-300">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              disabled={isPhoneSubmitting}
                              className="bg-slate-950/70 border-slate-800 focus:border-cyan-400 text-white rounded-xl text-xs h-10 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isPhoneSubmitting || otpCode.length !== 6 || !newPassword || !confirmPassword}
                        className="w-full gradient-bg hover:opacity-90 text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center space-x-2 mt-2"
                      >
                        {isPhoneSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify OTP & Set New Password</span>
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {phoneStep === "success" && (
                    <div className="space-y-4 text-center py-2 animate-fade-in">
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Password Reset Successfully</span>
                        </div>
                        <p className="leading-relaxed text-slate-300">
                          Your account password has been updated. You can now log in using your new credentials.
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => {
                          navigate("/");
                          setTimeout(() => {
                            openAuthModal("signin");
                          }, 150);
                        }}
                        className="w-full gradient-bg text-white text-xs font-bold h-10 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30"
                      >
                        <span>Sign In Now</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
