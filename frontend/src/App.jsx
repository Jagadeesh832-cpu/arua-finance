import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ExpenseTracker from "./pages/ExpenseTracker";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthUserProvider } from "./helper/auth";
import { NotificationProvider } from "./helper/notificationContext";
import PhoneAuthModal from "./components/PhoneAuthModal";
import ChatButton from "./components/ChatButton";
import CalculateCompo from "./components/CalculateCompo";

const queryClient = new QueryClient();

const App = () => (
  <AuthUserProvider>
    <NotificationProvider>
      <PhoneAuthModal />
      <QueryClientProvider client={queryClient}>
        <ChatButton />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <ExpenseTracker />
                  </ProtectedRoute>
                }
              />
              <Route path="/calculate" element={<CalculateCompo />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </NotificationProvider>
  </AuthUserProvider>
);

export default App;
