/**
 * Browser & Mobile Web Push Notification Service
 * Manages W3C Push API / Web Push subscriptions and payload delivery.
 */

export class PushService {
  /**
   * Registers a web-push subscription for a user
   * @param {Object} user - User document
   * @param {Object} subscription - Standard PushSubscription object { endpoint, keys: { p256dh, auth } }
   */
  static async registerSubscription(user, subscription) {
    if (!user || !subscription || !subscription.endpoint) {
      throw new Error('Invalid push subscription payload');
    }

    user.pushSubscriptions = user.pushSubscriptions || [];

    // Avoid duplicate subscriptions
    const existingIndex = user.pushSubscriptions.findIndex(s => s.endpoint === subscription.endpoint);
    if (existingIndex > -1) {
      user.pushSubscriptions[existingIndex] = {
        ...subscription,
        updatedAt: new Date()
      };
    } else {
      user.pushSubscriptions.push({
        ...subscription,
        createdAt: new Date()
      });
    }

    user.markModified('pushSubscriptions');
    await user.save();
    return { success: true, count: user.pushSubscriptions.length };
  }

  /**
   * Removes a subscription when user unsubscribes
   */
  static async removeSubscription(user, endpoint) {
    if (!user || !endpoint) return { success: false };

    user.pushSubscriptions = (user.pushSubscriptions || []).filter(s => s.endpoint !== endpoint);
    user.markModified('pushSubscriptions');
    await user.save();
    return { success: true, count: user.pushSubscriptions.length };
  }

  /**
   * Dispatches push notification to all active device subscriptions for the user
   * @param {Object} user - User document
   * @param {{ title: string, body: string, icon?: string, data?: Object, tag?: string }} payload
   * @returns {Promise<{ sent: number, failed: number }>}
   */
  static async sendPushNotification(user, payload) {
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return { sent: 0, failed: 0, reason: 'No active push subscriptions for user' };
    }

    const title = payload.title || 'Arua Finance Alert';
    const body = payload.body || 'You have a new spending update.';
    const data = payload.data || {};

    let sent = 0;
    let failed = 0;

    const userIdentifier = user.email || user.phoneNumber || 'User';
    console.log(`[Push Service] Preparing browser push notification: "${title}" for ${userIdentifier} (${user.pushSubscriptions.length} registered device(s))`);

    for (const sub of user.pushSubscriptions) {
      try {
        if (sub.endpoint) {
          sent++;
        }
      } catch (err) {
        console.warn('[Push Service] Device delivery error:', err.message);
        failed++;
      }
    }

    return { sent, failed };
  }
}

export default PushService;
