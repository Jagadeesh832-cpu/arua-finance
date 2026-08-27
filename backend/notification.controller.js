import { Notification } from './notification.model.js';
import { User } from './user.model.js';
import { findUserByIdentifier, sanitizeUser } from './user.controller.js';
import { PushService } from './push.service.js';
import { SmsService } from './sms.service.js';

export class NotificationController {
  /**
   * Helper to resolve the authenticated user from req.user (JWT) or query/body identifier
   */
  static async resolveUser(req) {
    if (req.user && req.user._id) {
      return await User.findById(req.user._id);
    }
    const identifier = req.query?.identifier || req.query?.email || req.query?.phone || req.body?.identifier || req.body?.email || req.body?.phone;
    if (identifier) {
      return await findUserByIdentifier(identifier);
    }
    return null;
  }

  /**
   * GET /api/notifications - List user's notifications
   */
  static async getNotifications(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const limit = parseInt(req.query.limit || '50', 10);
      const unreadOnly = req.query.unread === 'true';

      const filter = { userId: user._id };
      if (unreadOnly) filter.isRead = false;

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);

      const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

      res.status(200).json({
        success: true,
        notifications,
        unreadCount
      });
    } catch (err) {
      console.error('[NotificationController] getNotifications error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  }

  /**
   * GET /api/notifications/unread-count - Fast unread counter
   */
  static async getUnreadCount(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const count = await Notification.countDocuments({ userId: user._id, isRead: false });
      res.status(200).json({ success: true, count });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/notifications/:id/read - Mark one notification as read
   */
  static async markAsRead(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: user._id },
        { $set: { isRead: true } },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

      res.status(200).json({
        success: true,
        notification,
        unreadCount
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/notifications/read-all - Mark all user notifications as read
   */
  static async markAllAsRead(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      await Notification.updateMany(
        { userId: user._id, isRead: false },
        { $set: { isRead: true } }
      );

      res.status(200).json({
        success: true,
        unreadCount: 0,
        message: 'All notifications marked as read'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/notifications/:id - Delete single notification
   */
  static async deleteNotification(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const deleted = await Notification.findOneAndDelete({ _id: id, userId: user._id });

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

      res.status(200).json({
        success: true,
        unreadCount,
        message: 'Notification deleted successfully'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/notifications - Clear all notifications
   */
  static async clearAllNotifications(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      await Notification.deleteMany({ userId: user._id });

      res.status(200).json({
        success: true,
        unreadCount: 0,
        message: 'Notification history cleared'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/notifications/preferences - Fetch user preferences
   */
  static async getPreferences(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      res.status(200).json({
        success: true,
        preferences: user.notificationPreferences || {},
        phoneVerified: !!user.phoneVerified,
        phoneNumber: user.phoneNumber || ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/notifications/preferences - Update user notification preferences
   */
  static async updatePreferences(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const updates = req.body || {};
      user.notificationPreferences = {
        ...(user.notificationPreferences || {}),
        ...updates
      };

      user.markModified('notificationPreferences');
      await user.save();

      res.status(200).json({
        success: true,
        preferences: user.notificationPreferences,
        user: sanitizeUser(user),
        message: 'Notification preferences updated successfully'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/notifications/push/subscribe - Register web-push subscription
   */
  static async subscribePush(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const subscription = req.body.subscription || req.body;
      const result = await PushService.registerSubscription(user, subscription);

      res.status(200).json({
        success: true,
        message: 'Push notification subscription registered successfully',
        count: result.count
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/notifications/push/test - Dispatch test in-app & push notification
   */
  static async testNotification(req, res) {
    try {
      const user = await NotificationController.resolveUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Create test in-app notification
      const testNotif = new Notification({
        userId: user._id,
        title: '🔔 Arua Finance Alert Test',
        message: 'Your spending alert and notification channel is active and operating normally.',
        type: 'info',
        priority: 'low',
        isRead: false,
        relatedFeature: 'system',
        metadata: { isTest: true }
      });
      await testNotif.save();

      // Trigger push if subscribed
      let pushResult = { sent: 0 };
      if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
        pushResult = await PushService.sendPushNotification(user, {
          title: '🔔 Arua Finance Alert Test',
          body: 'Your spending alert and notification channel is active and operating normally.'
        });
      }

      const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

      res.status(200).json({
        success: true,
        notification: testNotif,
        unreadCount,
        pushResult,
        message: 'Test notification triggered successfully!'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default NotificationController;
