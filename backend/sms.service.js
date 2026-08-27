/**
 * Real SMS Spending Alert Service for Arua Finance
 * Dispatches real transactional SMS alerts to verified Indian mobile numbers via 2Factor.in SMS Gateway.
 */

export class SmsService {
  static getApiKey() {
    const key = process.env.TWOFACTOR_API_KEY || process.env.TWO_FACTOR_API_KEY;
    return key ? key.trim() : null;
  }

  static getSenderId() {
    return (process.env.SMS_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'ARUAFN').trim();
  }

  /**
   * Formats and cleans Indian mobile numbers to 10 digits
   */
  static cleanPhoneNumber(rawPhone) {
    const digits = String(rawPhone || '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  /**
   * Dispatches a real transactional SMS spending alert
   * @param {string} rawPhone - Indian mobile number (e.g. +91XXXXXXXXXX or 10-digit)
   * @param {string} message - The transactional SMS message text
   * @returns {Promise<{ success: boolean, delivered: boolean, message: string, sessionId?: string }>}
   */
  static async sendSpendingAlert(rawPhone, message) {
    const phone10 = this.cleanPhoneNumber(rawPhone);
    const apiKey = this.getApiKey();

    if (phone10.length !== 10) {
      return {
        success: false,
        delivered: false,
        message: 'Invalid Indian mobile number. SMS alert was not dispatched.'
      };
    }

    const maskedPhone = `+91 ${phone10.slice(0, 2)}******${phone10.slice(-2)}`;

    if (!apiKey) {
      console.log(`[SMS Service] Real SMS not sent to ${maskedPhone} (TWOFACTOR_API_KEY not configured in backend/.env)`);
      return {
        success: false,
        delivered: false,
        message: 'TWOFACTOR_API_KEY is not configured in backend/.env. SMS delivery skipped safely.'
      };
    }

    try {
      const senderId = this.getSenderId();
      console.log(`[SMS Service] Dispatching real financial SMS alert to ${maskedPhone}...`);

      // 2Factor.in Transactional SMS Gateway URL
      const url = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(phone10)}&from=${encodeURIComponent(senderId)}&msg=${encodeURIComponent(message)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json().catch(() => ({ Status: 'Error', Details: 'Invalid JSON response from gateway' }));
      console.log(`[SMS Service] Gateway response for ${maskedPhone}:`, data.Status || data);

      if (data.Status === 'Success' || (typeof data.Details === 'string' && data.Details.toLowerCase().includes('success'))) {
        return {
          success: true,
          delivered: true,
          sessionId: data.Details,
          message: `Real SMS alert delivered to ${maskedPhone}`
        };
      } else {
        console.warn(`[SMS Service] SMS Gateway returned non-success for ${maskedPhone}:`, data.Details || data);
        return {
          success: false,
          delivered: false,
          message: data.Details || '2Factor gateway could not deliver SMS. Check account balance or SMS template.'
        };
      }
    } catch (error) {
      console.error('[SMS Service] Network error sending SMS:', error.message);
      return {
        success: false,
        delivered: false,
        message: `Network error connecting to SMS provider: ${error.message}`
      };
    }
  }

  /**
   * Helper formatters for standard Arua Finance SMS templates
   */
  static formatThresholdMessage({ threshold, budget, spent, remaining, overAmount }) {
    const b = Number(budget || 0).toLocaleString('en-IN');
    const s = Number(spent || 0).toLocaleString('en-IN');
    const r = Number(remaining || 0).toLocaleString('en-IN');
    const o = Number(overAmount || 0).toLocaleString('en-IN');

    if (threshold >= 100 || overAmount > 0) {
      return `ARUA FINANCE CRITICAL ALERT\nYou have exceeded your monthly budget.\nBudget: Rs.${b}\nSpent: Rs.${s}\nOver Limit: Rs.${o}\nPlease review your expenses in Arua Finance.`;
    }

    if (threshold === 90) {
      return `ARUA FINANCE WARNING\nYou have used 90% of your monthly budget (Rs.${s}/Rs.${b}). Only Rs.${r} remains. Please control your discretionary spending.`;
    }

    if (threshold === 75) {
      return `ARUA FINANCE ALERT\nYou have used 75% of your monthly budget (Rs.${s}/Rs.${b}). Remaining budget: Rs.${r}.`;
    }

    return `ARUA FINANCE ALERT\nYou have used 50% of your monthly budget.\nBudget: Rs.${b} | Spent: Rs.${s} | Remaining: Rs.${r}`;
  }

  static formatCategoryMessage({ category, percent, spent, budget, overAmount }) {
    const s = Number(spent || 0).toLocaleString('en-IN');
    const b = Number(budget || 0).toLocaleString('en-IN');
    const o = Number(overAmount || 0).toLocaleString('en-IN');

    if (overAmount > 0) {
      return `ARUA FINANCE ALERT\nYou exceeded your ${category} budget by Rs.${o} (Spent: Rs.${s}, Budget: Rs.${b}).`;
    }
    return `ARUA FINANCE ALERT\nYou have used ${percent}% of your ${category} budget (Spent: Rs.${s} of Rs.${b}).`;
  }

  static formatAnomalyMessage({ amount, description }) {
    const a = Number(amount || 0).toLocaleString('en-IN');
    return `ARUA FINANCE SECURITY ALERT\nAn unusual expense of Rs.${a} (${description}) was recorded.\nPlease review your recent transactions in Arua Finance.`;
  }
}

export default SmsService;
