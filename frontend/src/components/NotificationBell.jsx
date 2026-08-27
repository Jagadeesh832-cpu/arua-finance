import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/helper/notificationContext";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Settings,
  ExternalLink
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function timeAgo(dateInput) {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const [isOpen, setIsOpen] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const getPriorityIcon = (type, priority) => {
    if (type === "critical" || priority === "critical") {
      return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
    if (type === "warning" || priority === "high") {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    if (type === "success") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    return <Info className="w-4 h-4 text-cyan-400" />;
  };

  const getPriorityBadgeClass = (type, priority) => {
    if (type === "critical" || priority === "critical") {
      return "bg-rose-950/60 border-rose-800/60 text-rose-300";
    }
    if (type === "warning" || priority === "high") {
      return "bg-amber-950/60 border-amber-800/60 text-amber-300";
    }
    if (type === "success") {
      return "bg-emerald-950/60 border-emerald-800/60 text-emerald-300";
    }
    return "bg-blue-950/60 border-blue-800/60 text-cyan-300";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all group"
          title="Notifications & Spending Alerts"
          aria-label="View notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-4 h-4 text-cyan-400 animate-pulse" />
          ) : (
            <Bell className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
          )}

          {/* Unread Counter Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-[10px] font-black text-white shadow-md shadow-rose-500/50 animate-bounce">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 bg-[#0c1222]/95 backdrop-blur-2xl border border-slate-800 text-slate-100 rounded-2xl shadow-2xl shadow-black/80 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800/90 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-[11px] font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg flex items-center space-x-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 px-2 text-[11px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg flex items-center space-x-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex px-3 pt-2.5 pb-1.5 space-x-2 border-b border-slate-800/40 bg-slate-950/30">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-800/50 pr-0.5">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Sparkles className="w-5 h-5 text-cyan-400/70" />
              </div>
              <p className="text-xs font-bold text-slate-200">You're all caught up!</p>
              <p className="text-[11px] text-slate-400">
                {filter === "unread" ? "No unread alerts at the moment." : "No alerts or notifications recorded."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 transition-colors flex items-start space-x-3 group relative ${
                  notif.isRead
                    ? "bg-transparent hover:bg-slate-900/40 opacity-75 hover:opacity-100"
                    : "bg-blue-950/20 hover:bg-blue-950/30"
                }`}
              >
                {/* Unread Glow Dot */}
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-3.5 left-1.5 shadow-sm shadow-cyan-400"></span>
                )}

                {/* Priority Icon */}
                <div
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getPriorityBadgeClass(
                    notif.type,
                    notif.priority
                  )}`}
                >
                  {getPriorityIcon(notif.type, notif.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                    {notif.message}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 text-center">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Configure Spending Alert Preferences</span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
