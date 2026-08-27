import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth";
import { getApiBaseUrl } from "./apiUrl";
import { useToast } from "@/hooks/use-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, LoggedInUserData } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    inAppAlerts: true,
    pushAlerts: false,
    smsAlerts: false,
    emailAlerts: true,
    budgetThresholdAlerts: true,
    budgetExceededAlerts: true,
    categoryBudgetAlerts: true,
    unusualSpendingAlerts: true,
    goalMilestoneAlerts: true,
    monthlyReportAlerts: true,
    aiRecommendationAlerts: true,
    budgetThresholds: [50, 75, 90, 100]
  });
  const [pushPermissionStatus, setPushPermissionStatus] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("arua_auth_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const getUserIdentifier = useCallback(() => {
    return LoggedInUserData?.email || LoggedInUserData?.phoneNumber || user?.email || user?.phoneNumber || "";
  }, [LoggedInUserData, user]);

  /**
   * Fetch all notifications for the current authenticated user
   */
  const fetchNotifications = useCallback(async () => {
    const identifier = getUserIdentifier();
    if (!identifier) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(`${baseUrl}/api/notifications?identifier=${encodeURIComponent(identifier)}&limit=40`, {
        method: "GET",
        headers
      });

      const data = await res.json();
      if (data && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch notifications:", err.message);
    }
  }, [getUserIdentifier, getAuthHeaders]);

  /**
   * Fetch notification preferences
   */
  const fetchPreferences = useCallback(async () => {
    const identifier = getUserIdentifier();
    if (!identifier) return;

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(`${baseUrl}/api/notifications/preferences?identifier=${encodeURIComponent(identifier)}`, {
        method: "GET",
        headers
      });

      const data = await res.json();
      if (data && data.success && data.preferences) {
        setPreferences(prev => ({ ...prev, ...data.preferences }));
      }
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch preferences:", err.message);
    }
  }, [getUserIdentifier, getAuthHeaders]);

  // Initial load and periodic refresh when user logs in
  useEffect(() => {
    if (LoggedInUserData || user) {
      fetchNotifications();
      fetchPreferences();

      // Poll periodically every 30 seconds for background spending alerts
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [LoggedInUserData, user, fetchNotifications, fetchPreferences]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = async (id) => {
    if (!id) return;
    const identifier = getUserIdentifier();

    // Optimistic UI update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      await fetch(`${baseUrl}/api/notifications/${id}/read?identifier=${encodeURIComponent(identifier)}`, {
        method: "PATCH",
        headers
      });
    } catch (err) {
      console.error("[NotificationContext] Error marking as read:", err);
      fetchNotifications();
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    const identifier = getUserIdentifier();
    if (!identifier) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      await fetch(`${baseUrl}/api/notifications/read-all?identifier=${encodeURIComponent(identifier)}`, {
        method: "PATCH",
        headers
      });
      toast({
        title: "All caught up!",
        description: "All notifications marked as read."
      });
    } catch (err) {
      console.error("[NotificationContext] Error marking all as read:", err);
      fetchNotifications();
    }
  };

  /**
   * Delete a notification
   */
  const deleteNotification = async (id) => {
    if (!id) return;
    const identifier = getUserIdentifier();

    const target = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      await fetch(`${baseUrl}/api/notifications/${id}?identifier=${encodeURIComponent(identifier)}`, {
        method: "DELETE",
        headers
      });
    } catch (err) {
      console.error("[NotificationContext] Error deleting notification:", err);
      fetchNotifications();
    }
  };

  /**
   * Clear all notifications
   */
  const clearAll = async () => {
    const identifier = getUserIdentifier();
    if (!identifier) return;

    setNotifications([]);
    setUnreadCount(0);

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      await fetch(`${baseUrl}/api/notifications?identifier=${encodeURIComponent(identifier)}`, {
        method: "DELETE",
        headers
      });
    } catch (err) {
      console.error("[NotificationContext] Error clearing notifications:", err);
      fetchNotifications();
    }
  };

  /**
   * Update Notification Preferences
   */
  const updatePreferences = async (newPreferences) => {
    const identifier = getUserIdentifier();
    if (!identifier) return;

    const merged = { ...preferences, ...newPreferences };
    setPreferences(merged);

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(`${baseUrl}/api/notifications/preferences?identifier=${encodeURIComponent(identifier)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(merged)
      });

      const data = await res.json();
      if (data && data.success) {
        toast({
          title: "Preferences Saved",
          description: "Your notification and spending alert settings have been updated."
        });
      }
      return data;
    } catch (err) {
      console.error("[NotificationContext] Error saving preferences:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update notification preferences.",
        variant: "destructive"
      });
    }
  };

  /**
   * Request Browser Notification Permission & Enable Push
   */
  const requestPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Browser notifications are not supported by this browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermissionStatus(permission);

      if (permission === "granted") {
        await updatePreferences({ pushAlerts: true });
        
        // Show browser system notification test
        try {
          new window.Notification("🔔 Arua Finance Notifications Enabled", {
            body: "You will now receive real-time spending and budget alerts directly on this device.",
            icon: "/favicon-96x96.png"
          });
        } catch (e) {
          console.warn("Direct Notification trigger error:", e);
        }

        toast({
          title: "Push Notifications Enabled",
          description: "You will receive real-time spending warnings on this device."
        });
        return true;
      } else if (permission === "denied") {
        await updatePreferences({ pushAlerts: false });
        toast({
          title: "Permission Denied",
          description: "Please allow notifications in your browser settings to receive alerts.",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      console.error("Push permission error:", err);
      return false;
    }
  };

  /**
   * Send a test in-app and browser notification
   */
  const sendTestNotification = async () => {
    const identifier = getUserIdentifier();
    if (!identifier) return;

    try {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(`${baseUrl}/api/notifications/push/test?identifier=${encodeURIComponent(identifier)}`, {
        method: "POST",
        headers
      });

      const data = await res.json();
      if (data && data.success) {
        fetchNotifications();

        // If browser permission is granted, also show local browser notification
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new window.Notification("🔔 Arua Finance Alert Test", {
              body: "Your spending alert and notification channel is active and operating normally.",
              icon: "/favicon-96x96.png"
            });
          } catch (e) {}
        }

        toast({
          title: "Test Alert Dispatched",
          description: "A test notification was created in your inbox."
        });
      }
    } catch (err) {
      toast({
        title: "Test Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        preferences,
        pushPermissionStatus,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updatePreferences,
        requestPushPermission,
        sendTestNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;
