import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/helper/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";
import {
  Zap,
  X,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  KeyRound
} from "lucide-react";

export default function PhoneAuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authTab,
    setAuthTab,
    authStep,
    setAuthStep,
    maskedPhone,
    otpLength = 6,
    isSubmitting,
    isSendingOtp,
    isVerifyingOtp,
    authError,
    setAuthError,
    otpError,
    setOtpError,
    resendCooldown,
    signInUser,
    startSignUpOtp,
    verifySignUpOtp,
    resendSignUpOtp
  } = useAuth();

  // Sign In Method: "phone" (SMS OTP) | "email" (Email + Password)
  const [signInMethod, setSignInMethod] = useState("email"); // "email" | "phone"
  const [phoneLoginNumber, setPhoneLoginNumber] = useState("");
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form States
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const firstInputRef = useRef(null);

  // Auto-focus on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setFieldErrors({});
      setOtpCode("");
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 150);
    }
  }, [isAuthModalOpen, authTab, authStep, signInMethod]);

  // Auto-submit OTP when required digits are entered
  useEffect(() => {
    if (authStep === "otp" && otpCode.length === otpLength && !isVerifyingOtp) {
      verifySignUpOtp(otpCode);
    }
  }, [otpCode, otpLength, authStep]);

  if (!isAuthModalOpen) return null;

  // Handle Sign In Submit (Email + Password OR Phone + Password)
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (signInMethod === "phone") {
      const clean = phoneLoginNumber.replace(/\D/g, "");
      if (clean.length !== 10) {
        setAuthError("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
      if (!signInPassword) {
        setAuthError("Please enter your account password.");
        return;
      }
      await signInUser({
        identifier: `+91${clean}`,
        password: signInPassword
      });
    } else {
      if (!signInIdentifier.trim()) {
        setAuthError("Please enter your registered Gmail or Email address.");
        return;
      }
      if (!signInPassword) {
        setAuthError("Please enter your password.");
        return;
      }
      await signInUser({
        identifier: signInIdentifier.trim(),
        password: signInPassword
      });
    }
  };

  // Validate Sign Up Form Fields
  const validateSignUpForm = () => {
    const errors = {};
    if (!signUpForm.name.trim()) {
      errors.name = "Please enter your name.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signUpForm.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(signUpForm.email.trim())) {
      errors.email = "Please enter a valid email format.";
    }

    const cleanPhone = signUpForm.phoneNumber.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.phoneNumber = "Mobile number is required.";
    } else if (cleanPhone.length !== 10) {
      errors.phoneNumber = "Please enter exactly 10 digits.";
    }

    if (!signUpForm.password) {
      errors.password = "Password is required.";
    } else if (signUpForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!signUpForm.confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (signUpForm.password !== signUpForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Sign Up Form Submit (Step 1: Validate & Send SMS OTP)
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!validateSignUpForm()) return;

    const cleanPhone = signUpForm.phoneNumber.replace(/\D/g, "");
    await startSignUpOtp({
      name: signUpForm.name.trim(),
      email: signUpForm.email.toLowerCase().trim(),
      phoneNumber: `+91${cleanPhone}`,
      password: signUpForm.password,
      confirmPassword: signUpForm.confirmPassword
    });
  };

  // Handle OTP Submit (Step 2: Verify & Create User in MongoDB)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    await verifySignUpOtp(otpCode);
  };

  const handlePhoneInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setSignUpForm((prev) => ({ ...prev, phoneNumber: digits }));
    if (fieldErrors.phoneNumber) {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Modal Card */}
      <div className="arua-card w-full max-w-md my-auto rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden text-slate-100 animate-slide-up">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          disabled={isSubmitting || isSendingOtp || isVerifyingOtp}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Arua <span className="gradient-text">Finance</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                AI • ₹
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smarter Money. Powered by AI.</p>
          </div>
        </div>

        {/* Auth Step: Form (Sign In or Sign Up) */}
        {authStep === "form" && (
          <div>
            {/* Top Navigation Tabs: Sign In | Create Account */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("signin");
                  setAuthError("");
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authTab === "signin"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("signup");
                  setAuthError("");
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authTab === "signup"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Banner */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-300 text-xs flex items-start space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* =============================== */}
            {/* TAB 1: SIGN IN FORM             */}
            {/* =============================== */}
            {authTab === "signin" && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Secondary Method Tabs: ✉️ Email | 📱 Mobile */}
                <div className="flex items-center space-x-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("email");
                      setAuthError("");
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      signInMethod === "email"
                        ? "bg-slate-800 text-cyan-300 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>✉️ Email Address</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("phone");
                      setAuthError("");
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      signInMethod === "phone"
                        ? "bg-slate-800 text-cyan-300 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📱 Mobile Number</span>
                  </button>
                </div>

                {/* Method 1: Email Input */}
                {signInMethod === "email" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        ref={firstInputRef}
                        type="email"
                        placeholder="name@gmail.com"
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pl-10 focus-visible:ring-blue-500 text-sm font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  /* Method 2: Phone Input */
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Indian Mobile Number
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          ref={firstInputRef}
                          type="tel"
                          inputMode="numeric"
                          placeholder="98765 43210"
                          value={phoneLoginNumber}
                          onChange={(e) => setPhoneLoginNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          required
                          disabled={isSubmitting}
                          className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 text-sm font-semibold tracking-wide"
                        />
                        <Smartphone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <a
                      href="/forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        closeAuthModal();
                        window.location.href = "/forgot-password";
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-10 focus-visible:ring-blue-500 text-sm font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:scale-102 active:scale-98 transition-all text-sm border border-blue-400/30 flex items-center justify-center space-x-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Arua Finance</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("signup");
                      setAuthError("");
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* =============================== */}
            {/* TAB 2: SIGN UP FORM             */}
            {/* =============================== */}
            {authTab === "signup" && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1 scrollbar-none">
                {/* Single Name Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Name</label>
                  <div className="relative">
                    <Input
                      ref={firstInputRef}
                      type="text"
                      placeholder="Enter your name"
                      value={signUpForm.name}
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      required
                      disabled={isSendingOtp}
                      className="h-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pl-9 text-xs font-medium"
                    />
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Gmail / Email Address</label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="name@gmail.com"
                      value={signUpForm.email}
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                      }}
                      required
                      disabled={isSendingOtp}
                      className="h-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pl-9 text-xs font-medium"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Indian Mobile Number with SMS badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">
                      📱 Indian Mobile (for Real 2Factor SMS OTP)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">{signUpForm.phoneNumber.length}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={signUpForm.phoneNumber}
                        onChange={handlePhoneInputChange}
                        required
                        disabled={isSendingOtp}
                        className="h-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 text-xs font-semibold tracking-wide"
                      />
                      <Smartphone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                  {fieldErrors.phoneNumber && (
                    <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Passwords Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Password</label>
                    <div className="relative">
                      <Input
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Min 6 chars"
                        value={signUpForm.password}
                        onChange={(e) => {
                          setSignUpForm({ ...signUpForm, password: e.target.value });
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                        }}
                        required
                        disabled={isSendingOtp}
                        className="h-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 text-xs font-medium pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => {
                          setSignUpForm({ ...signUpForm, confirmPassword: e.target.value });
                          if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                        }}
                        required
                        disabled={isSendingOtp}
                        className="h-10 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 text-xs font-medium pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Primary Action Button: Register & Send OTP */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full h-11 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:scale-102 active:scale-98 transition-all text-xs border border-blue-400/30 flex items-center justify-center space-x-2"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Sending SMS Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Register & Send OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center text-xs text-slate-400 pt-1">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("signin");
                      setAuthError("");
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Auth Step: OTP Verification (For Sign Up) */}
        {authStep === "otp" && (
          <div className="animate-fade-in">
            <div className="mb-5">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real 2Factor SMS Verification</span>
              </div>
              <h2 className="text-xl font-black text-white">Enter {otpLength}-Digit SMS OTP</h2>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                <span>Code sent via SMS to <strong className="text-slate-200">{maskedPhone || signUpForm.phoneNumber}</strong></span>
                <button
                  onClick={() => {
                    setAuthStep("form");
                    setOtpError("");
                  }}
                  disabled={isVerifyingOtp}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-2"
                >
                  Edit Details
                </button>
              </div>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {/* Dynamic 6-Digit OTP Box */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                {otpLength === 6 ? (
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      if (otpError) setOtpError("");
                    }}
                    disabled={isVerifyingOtp}
                  >
                    <InputOTPGroup className="gap-2 sm:gap-2.5">
                      <InputOTPSlot index={0} className="w-10 sm:w-11 h-12 text-lg font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500" />
                      <InputOTPSlot index={1} className="w-10 sm:w-11 h-12 text-lg font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500" />
                      <InputOTPSlot index={2} className="w-10 sm:w-11 h-12 text-lg font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500" />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-slate-600 font-bold mx-1" />
                    <InputOTPGroup className="gap-2 sm:gap-2.5">
                      <InputOTPSlot index={3} className="w-10 sm:w-11 h-12 text-lg font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500" />
                      <InputOTPSlot index={4} className="w-10 sm:w-11 h-12 text-lg font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500" />
                      <InputOTPSlot index={5} className="w-10 sm:w-11 h-12 text-lg font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500" />
                    </InputOTPGroup>
                  </InputOTP>
                ) : (
                  <InputOTP
                    maxLength={otpLength}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      if (otpError) setOtpError("");
                    }}
                    disabled={isVerifyingOtp}
                  >
                    <InputOTPGroup className="gap-2.5 sm:gap-3">
                      {Array.from({ length: otpLength }).map((_, idx) => (
                        <InputOTPSlot
                          key={idx}
                          index={idx}
                          className="w-12 h-14 text-xl font-extrabold rounded-xl bg-slate-950 border-slate-800 text-white focus:border-blue-500 shadow-inner"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              </div>

              {/* Error Message Banner */}
              {otpError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-300 text-xs flex items-start space-x-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Submit Verification Button */}
              <Button
                type="submit"
                disabled={otpCode.length !== otpLength || isVerifyingOtp}
                className="w-full h-11 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:scale-102 active:scale-98 transition-all text-sm border border-blue-400/30 flex items-center justify-center space-x-2"
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying & Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Arua Finance</span>
                  </>
                )}
              </Button>

              {/* Resend OTP Timer & Button */}
              <div className="text-center text-xs text-slate-400 pt-1">
                {resendCooldown > 0 ? (
                  <span>
                    Resend SMS OTP in <strong className="text-cyan-300">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendSignUpOtp}
                    disabled={isSendingOtp || isVerifyingOtp}
                    className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-all"
                  >
                    Didn't receive SMS? Resend OTP
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
