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
import { AuthUserProvider } from "./helper/auth";
import PhoneAuthModal from "./components/PhoneAuthModal";
import ChatButton from "./components/ChatButton";
import CalculateCompo from "./components/CalculateCompo";

const queryClient = new QueryClient();

const App = () => (
  <AuthUserProvider>
    <PhoneAuthModal />
    <QueryClientProvider client={queryClient}>
      <ChatButton />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/expenses" element={<ExpenseTracker />} />
            <Route path="/calculate" element={<CalculateCompo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthUserProvider>
);

export default App;
