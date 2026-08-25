import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/helper/auth";
import {
  Sparkles,
  Home,
  BarChart3,
  ReceiptText,
  User as UserIcon,
  ArrowRight,
  Zap,
  Phone,
  LogOut,
  ChevronDown,
  ShieldCheck,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, LoggedInUserData, openAuthModal, signOutUser } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/expenses", label: "Expense Radar", icon: BarChart3 },
    { path: "/calculate", label: "Tax Studio", badge: "FY 25–26", icon: ReceiptText },
    { path: "/profile", label: "Profile", icon: UserIcon },
  ];

  const handleSignOut = async () => {
    await signOutUser();
    navigate("/");
  };

  const displayName = LoggedInUserData?.name || (user?.phoneNumber ? `Investor (${user.phoneNumber.slice(-4)})` : "Investor");
  const displayPhone = user?.phoneNumber || LoggedInUserData?.phoneNumber || "";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85 border-b border-slate-800/80 shadow-2xl shadow-black/40 transition-all">
      <div className="container mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Arua <span className="gradient-text">Finance</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-cyan-400 border border-cyan-500/30">
                  AI • ₹
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                Smarter Money. Powered by AI.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/30 to-violet-600/30 text-cyan-300 border border-blue-500/40 shadow-sm shadow-blue-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30 hidden lg:inline-block">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Phone Auth Profile Button */}
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all text-left group">
                    <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-black shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-slate-200 leading-tight group-hover:text-cyan-300 transition-colors">
                        {displayName}
                      </p>
                      {displayPhone && (
                        <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                          {displayPhone}
                        </p>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0c1222] border border-slate-800 text-slate-200 shadow-2xl rounded-2xl p-1.5 animate-slide-up">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-xs font-bold text-white">{displayName}</p>
                    {displayPhone && (
                      <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{displayPhone}</p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-semibold focus:bg-slate-850 hover:bg-slate-900 cursor-pointer">
                    <Link to="/dashboard" className="flex items-center space-x-2 w-full">
                      <Home className="w-4 h-4 text-blue-400" />
                      <span>Executive Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-semibold focus:bg-slate-850 hover:bg-slate-900 cursor-pointer">
                    <Link to="/expenses" className="flex items-center space-x-2 w-full">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span>Expense Radar (₹)</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-semibold focus:bg-slate-850 hover:bg-slate-900 cursor-pointer">
                    <Link to="/profile" className="flex items-center space-x-2 w-full">
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      <span>Profile & Calibration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-xl px-3 py-2 text-xs font-bold text-rose-400 focus:bg-rose-950/40 hover:bg-rose-950/40 cursor-pointer flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/calculate"
                  className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-purple-950/70 hover:from-blue-900/90 hover:to-indigo-900/90 border border-blue-500/30 hover:border-cyan-400/50 shadow-md transition-all group hover:scale-102"
                >
                  <ReceiptText className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="text-white group-hover:text-cyan-200">Tax Studio</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                    FY 25–26
                  </span>
                </Link>

                <Button
                  onClick={() => openAuthModal("signin")}
                  className="gradient-bg text-white font-bold rounded-xl px-4 py-1.5 text-xs shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all border border-blue-400/30 flex items-center space-x-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Sign In / Sign Up</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden mt-3 pt-2.5 border-t border-slate-800/80 flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30 border border-blue-400/40"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
