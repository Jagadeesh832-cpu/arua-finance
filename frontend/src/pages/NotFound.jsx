import { Link } from "react-router-dom";
import { useAuth } from "@/helper/auth";
import { Zap, ArrowLeft, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { FirstLoader } = useAuth();

  if (FirstLoader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-slate-100">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-300">
            Connecting to Arua Finance...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-slate-100 p-6 relative">
      <div className="arua-card rounded-3xl p-8 sm:p-12 max-w-md w-full text-center border border-slate-800 shadow-2xl animate-slide-up">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25 border border-blue-400/30">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-5xl font-black gradient-text mb-2">404</h1>
        <h2 className="text-lg font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          The requested page doesn't exist or requires an active Arua Finance session.
        </p>
        <Link to="/">
          <Button className="gradient-bg text-white font-bold rounded-xl px-6 py-2.5 shadow-lg shadow-blue-500/25 hover:scale-105 transition-all text-xs sm:text-sm border border-blue-400/30">
            <Home className="w-4 h-4 mr-2" />
            Return to Arua Finance
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
