"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import SaveUserDataFunc from "./SaveUserDataFunc";
import GetUserDataFunc from "./GetUserDataFunc";
import { getApiBaseUrl } from "./apiUrl";

export const OTP_LENGTH = parseInt(import.meta.env.VITE_OTP_LENGTH || "6", 10);

const AuthUserContext = createContext();

export function useRajAuth() {
  const [user, setUser] = useState(null);
  const [LoggedInUserData, setLoggedInUserData] = useState(null);
  const [FirstLoader, setFirstLoader] = useState(true);

  // Modal & Tab States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin"); // "signin" | "signup"
  const [authStep, setAuthStep] = useState("form"); // "form" | "otp"

  // Registration & OTP Data
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [phoneNumber, setPhoneNumber] = useState(""); // +91XXXXXXXXXX
  const [maskedPhone, setMaskedPhone] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [otpLength, setOtpLength] = useState(OTP_LENGTH);

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownTimerRef = useRef(null);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [resendCooldown]);

  // Load existing user session from localStorage on initial load
  useEffect(() => {
    const initSession = async () => {
      setFirstLoader(true);
      try {
        const storedPhone = localStorage.getItem("arua_user_phone");
        const storedEmail = localStorage.getItem("arua_user_email");
        const identifier = storedPhone || storedEmail;

        if (identifier) {
          setUser({ phoneNumber: storedPhone || "", email: storedEmail || "" });
          const dbUser = await GetUserDataFunc(identifier);
          if (dbUser) {
            setLoggedInUserData(dbUser);
            try { localStorage.setItem("arua_user_data", JSON.stringify(dbUser)); } catch (e) {}
          } else {
            const cachedData = localStorage.getItem("arua_user_data");
            if (cachedData) {
              try {
                setLoggedInUserData(JSON.parse(cachedData));
              } catch (e) {
                // Ignore parse error
              }
            } else if (storedPhone) {
              const clean10 = storedPhone.replace(/\D/g, "").slice(-10);
              const fallbackUser = {
                phoneNumber: storedPhone,
                name: `Investor ${clean10.slice(-4)}`,
                email: `${clean10}@arua.finance`,
                annualIncome: 1200000,
                monthlyBudget: 50000,
                riskTolerance: "Medium",
                expenses: [],
                goals: []
              };
              setLoggedInUserData(fallbackUser);
              try { localStorage.setItem("arua_user_data", JSON.stringify(fallbackUser)); } catch (e) {}
            }
          }
        } else {
          setUser(null);
          setLoggedInUserData(null);
        }
      } catch (err) {
        console.error("Error loading stored auth session:", err);
      } finally {
        setFirstLoader(false);
      }
    };

    initSession();
  }, []);

  const openAuthModal = (defaultTab = "signin") => {
    setAuthError("");
    setOtpError("");
    setAuthTab(defaultTab);
    setAuthStep("form");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    if (isSubmitting || isSendingOtp || isVerifyingOtp) return;
    setIsAuthModalOpen(false);
    setAuthError("");
    setOtpError("");
    setAuthStep("form");
  };

  /**
   * 1. SIGN IN: Authenticate with Email or Mobile + Password
   */
  const signInUser = async ({ identifier, password }) => {
    setAuthError("");
    setIsSubmitting(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || "Failed to sign in. Please verify your credentials.");
        return false;
      }

      // Successful login
      if (data.token) {
        localStorage.setItem("arua_auth_token", data.token);
      }
      if (data.user?.phoneNumber) {
        localStorage.setItem("arua_user_phone", data.user.phoneNumber);
      }
      if (data.user?.email) {
        localStorage.setItem("arua_user_email", data.user.email);
      }

      setUser(data.user);
      setLoggedInUserData(data.user);
      setIsAuthModalOpen(false);
      return true;
    } catch (error) {
      console.error("signInUser error:", error);
      setAuthError("Network error connecting to authentication server. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 2. SIGN UP: Step 1 - Validate form and dispatch 2Factor SMS OTP
   */
  const startSignUpOtp = async (formData) => {
    setAuthError("");
    setOtpError("");
    setIsSendingOtp(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || "Failed to send SMS OTP. Please check your details.");
        return false;
      }

      // Store in progress registration data
      setSignUpData(formData);
      setSessionId(data.sessionId);
      if (data.otpLength) {
        setOtpLength(Number(data.otpLength));
      }
      setMaskedPhone(data.maskedPhone || formData.phoneNumber);
      setPhoneNumber(data.phoneNumber || formData.phoneNumber);
      setAuthStep("otp");
      setResendCooldown(30);
      return true;
    } catch (error) {
      console.error("startSignUpOtp error:", error);
      setAuthError("Network error connecting to authentication server. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * 3. SIGN UP: Step 2 - Verify OTP & Create MongoDB User Account
   */
  const verifySignUpOtp = async (otpCode) => {
    setOtpError("");
    const cleanOtp = (otpCode || "").trim();

    if (cleanOtp.length !== otpLength) {
      setOtpError(`Please enter the complete ${otpLength}-digit verification code.`);
      return false;
    }

    if (!sessionId) {
      setOtpError("OTP session expired. Please restart sign up.");
      setAuthStep("form");
      return false;
    }

    setIsVerifyingOtp(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/signup-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signUpData,
          sessionId,
          otp: cleanOtp
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data.message || "Invalid verification code entered.");
        return false;
      }

      // Successful Registration and Login
      if (data.token) {
        localStorage.setItem("arua_auth_token", data.token);
      }
      if (data.user?.phoneNumber) {
        localStorage.setItem("arua_user_phone", data.user.phoneNumber);
      }
      if (data.user?.email) {
        localStorage.setItem("arua_user_email", data.user.email);
      }

      setUser(data.user);
      setLoggedInUserData(data.user);
      setIsAuthModalOpen(false);
      setAuthStep("form");
      setSessionId(null);
      return true;
    } catch (error) {
      console.error("verifySignUpOtp error:", error);
      setOtpError("Network error verifying code. Please try again.");
      return false;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /**
   * 4. Resend Sign Up SMS OTP
   */
  const resendSignUpOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp || !signUpData.phoneNumber) return;
    setOtpError("");
    setIsSendingOtp(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data.message || "Failed to resend SMS OTP.");
        return;
      }

      setSessionId(data.sessionId);
      if (data.otpLength) {
        setOtpLength(Number(data.otpLength));
      }
      setResendCooldown(30);
    } catch (error) {
      console.error("resendSignUpOtp error:", error);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * 5. Sign out current user
   */
  const signOutUser = async () => {
    try {
      localStorage.removeItem("arua_user_phone");
      localStorage.removeItem("arua_user_email");
      localStorage.removeItem("arua_auth_token");
      setUser(null);
      setLoggedInUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    LoggedInUserData,
    setLoggedInUserData,
    FirstLoader,
    setFirstLoader,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authTab,
    setAuthTab,
    authStep,
    setAuthStep,
    signUpData,
    setSignUpData,
    phoneNumber,
    maskedPhone,
    otpLength,
    setOtpLength,
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
    resendSignUpOtp,
    signOutUser
  };
}

export const AuthUserProvider = ({ children }) => {
  const authState = useRajAuth();
  return (
    <AuthUserContext.Provider value={authState}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuth = () => useContext(AuthUserContext);
