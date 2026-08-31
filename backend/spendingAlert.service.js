import { Notification } from './notification.model.js';
import { AnomalyService } from './anomaly.service.js';
import { SmsService } from './sms.service.js';
import { PushService } from './push.service.js';
import { SendMail } from './sendMail.controller.js';

/**
 * Master Real-Time Spending Alert & Multi-Channel Notification Engine
 */
export class SpendingAlertService {
  /**
   * Main entry point called whenever an authenticated user adds, edits, or deletes an expense.
   * @param {Object} user - Mongoose User document
   * @param {Object} [currentExpense] - The specific expense being added or updated
   * @param {string} [action] - 'create' | 'update' | 'delete' | 'budget_change'
   * @returns {Promise<{ alertSummary: Array, createdNotifications: Array, smsResults: Array }>}
   */
  static async processExpenseChange(user, currentExpense = null, action = 'create') {
    if (!user) return { alertSummary: [], createdNotifications: [], smsResults: [] };

    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const periodKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const todayDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

      // 1. Calculate user's actual spending for current month & today
      const monthExpenses = (user.expenses || []).filter(e => {
        const d = new Date(e.date || Date.now());
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const todayExpenses = (user.expenses || []).filter(e => {
        const d = new Date(e.date || Date.now());
        return d.toISOString().split('T')[0] === todayDateStr;
      });

      const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const totalTodaySpent = todayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const monthlyBudget = Number(user.monthlyBudget) || 0;
      const budgetUsagePercent = monthlyBudget > 0 ? (totalMonthSpent / monthlyBudget) * 100 : 0;
      const remainingBudget = Math.max(0, monthlyBudget - totalMonthSpent);
      const overBudgetAmount = Math.max(0, totalMonthSpent - monthlyBudget);

      // 2. Initialize duplicate alert prevention state for this month
      user.triggeredAlerts = user.triggeredAlerts || {};
      if (!user.triggeredAlerts[periodKey]) {
        user.triggeredAlerts[periodKey] = {
          thresholds: [],
          dailyAlerts: [],
          categories: {},
          lastOverBudgetAlert: null,
          lastOverBudgetAmount: 0
        };
      }
      const periodAlerts = user.triggeredAlerts[periodKey];
      periodAlerts.thresholds = periodAlerts.thresholds || [];
      periodAlerts.dailyAlerts = periodAlerts.dailyAlerts || [];
      periodAlerts.categories = periodAlerts.categories || {};

      const prefs = user.notificationPreferences || {};
      const activeThresholds = Array.isArray(prefs.budgetThresholds) && prefs.budgetThresholds.length > 0
        ? [...prefs.budgetThresholds].sort((a, b) => a - b)
        : [50, 75, 90, 100];

      const alertsToTrigger = [];

      // ========================================================
      // 3. Check Monthly Overall Budget Thresholds (50%, 75%, 90%, 100%)
      // ========================================================
      if (monthlyBudget > 0 && prefs.budgetThresholdAlerts !== false) {
        for (const threshold of activeThresholds) {
          if (budgetUsagePercent >= threshold && !periodAlerts.thresholds.includes(threshold)) {
            // New threshold crossed!
            periodAlerts.thresholds.push(threshold);

            let priority = 'medium';
            let type = 'info';
            let title = 'Arua Finance Budget Alert';
            let message = `You have used ${threshold}% of your monthly budget (₹${totalMonthSpent.toLocaleString('en-IN')} of ₹${monthlyBudget.toLocaleString('en-IN')}).`;

            if (threshold === 75) {
              priority = 'high';
              type = 'warning';
              title = 'Budget Alert: 75% Limit Reached';
              message = `You have used 75% of your monthly budget. Only ₹${remainingBudget.toLocaleString('en-IN')} remains.`;
            } else if (threshold === 90) {
              priority = 'high';
              type = 'warning';
              title = 'High Spending Warning: 90% Used';
              message = `Warning: You have used 90% of your monthly budget. Only ₹${remainingBudget.toLocaleString('en-IN')} remains. Please control your discretionary spending.`;
            } else if (threshold >= 100) {
              priority = 'critical';
              type = 'critical';
              title = '⚠️ Spending Limit Reached (100%)';
              message = `Alert: You have reached 100% of your planned monthly budget (₹${monthlyBudget.toLocaleString('en-IN')}).`;
            }

            alertsToTrigger.push({
              title,
              message,
              type,
              priority,
              channelType: 'budget',
              relatedFeature: 'budget',
              metadata: {
                threshold,
                totalMonthSpent,
                monthlyBudget,
                remainingBudget,
                budgetUsagePercent
              },
              smsText: SmsService.formatThresholdMessage({
                threshold,
                budget: monthlyBudget,
                spent: totalMonthSpent,
                remaining: remainingBudget,
                overAmount: 0
              })
            });
          }
        }

        // ========================================================
        // 4. Check Over-Budget Alerts (with Spam Throttling)
        // ========================================================
        if (budgetUsagePercent > 100 && prefs.budgetExceededAlerts !== false) {
          const prevOverAmount = Number(periodAlerts.lastOverBudgetAmount) || 0;
          const hasNotAlertedOver = !periodAlerts.lastOverBudgetAlert;
          // Only re-alert if spending grew by at least ₹500 or 10% of monthly budget
          const hasSignificantIncrease = overBudgetAmount >= (prevOverAmount + Math.max(500, monthlyBudget * 0.1));

          if (hasNotAlertedOver || hasSignificantIncrease) {
            periodAlerts.lastOverBudgetAlert = new Date();
            periodAlerts.lastOverBudgetAmount = overBudgetAmount;

            const formattedOver = `₹${overBudgetAmount.toLocaleString('en-IN')}`;
            const formattedBudget = `₹${monthlyBudget.toLocaleString('en-IN')}`;
            const formattedSpent = `₹${totalMonthSpent.toLocaleString('en-IN')}`;

            alertsToTrigger.push({
              title: '🚨 Critical Alert: Monthly Budget Exceeded',
              message: `You have exceeded your monthly budget of ${formattedBudget} by ${formattedOver} (Total Spent: ${formattedSpent}).`,
              type: 'critical',
              priority: 'critical',
              channelType: 'budget',
              relatedFeature: 'budget',
              metadata: {
                threshold: 100,
                overBudgetAmount,
                totalMonthSpent,
                monthlyBudget,
                budgetUsagePercent
              },
              smsText: SmsService.formatThresholdMessage({
                threshold: 101,
                budget: monthlyBudget,
                spent: totalMonthSpent,
                remaining: 0,
                overAmount: overBudgetAmount
              })
            });
          }
        }
      }

      // ========================================================
      // 5. Check Daily Spending Summary Alert (Sensible threshold, 1 SMS per day max)
      // ========================================================
      if (totalTodaySpent >= 2500 && prefs.dailySpendingAlerts !== false) {
        if (!periodAlerts.dailyAlerts.includes(todayDateStr)) {
          periodAlerts.dailyAlerts.push(todayDateStr);
          alertsToTrigger.push({
            title: 'Daily Spending Notice',
            message: `You have spent ₹${totalTodaySpent.toLocaleString('en-IN')} today.`,
            type: 'info',
            priority: 'medium',
            channelType: 'daily',
            relatedFeature: 'daily_spending',
            metadata: {
              date: todayDateStr,
              totalTodaySpent
            },
            smsText: SmsService.formatDailySpendingMessage(totalTodaySpent)
          });
        }
      }

      // ========================================================
      // 6. Category-wise Budget Alerts
      // ========================================================
      if (currentExpense && currentExpense.category && monthlyBudget > 0 && prefs.categoryBudgetAlerts !== false) {
        const cat = currentExpense.category;
        periodAlerts.categories[cat] = periodAlerts.categories[cat] || [];

        const categoryWeights = {
          'Food & Dining': 0.25,
          'Rent & Housing': 0.30,
          'Utilities': 0.10,
          'Transport': 0.10,
          'Entertainment': 0.08,
          'Shopping': 0.07,
          'Healthcare': 0.05,
          'EMI & Loans': 0.15,
          'Other': 0.10
        };

        const catWeight = categoryWeights[cat] || 0.15;
        const catBudget = Math.round(monthlyBudget * catWeight);

        const catSpent = monthExpenses
          .filter(e => e.category === cat)
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const catPercent = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
        const catOver = Math.max(0, catSpent - catBudget);

        if (catPercent >= 75 && !periodAlerts.categories[cat].includes(75)) {
          periodAlerts.categories[cat].push(75);
          alertsToTrigger.push({
            title: `${cat} Budget Notice`,
            message: `You have used ${catPercent.toFixed(0)}% of your planned ${cat} budget (₹${catSpent.toLocaleString('en-IN')} of ₹${catBudget.toLocaleString('en-IN')}).`,
            type: 'warning',
            priority: 'medium',
            channelType: 'budget',
            relatedFeature: 'category_budget',
            metadata: { category: cat, catSpent, catBudget, catPercent },
            smsText: SmsService.formatCategoryMessage({ category: cat, percent: 75, spent: catSpent, budget: catBudget, overAmount: 0 })
          });
        }

        if (catPercent >= 100 && !periodAlerts.categories[cat].includes(100)) {
          periodAlerts.categories[cat].push(100);
          alertsToTrigger.push({
            title: `⚠️ ${cat} Spending Limit Reached`,
            message: `You have reached the budget limit for ${cat} (₹${catSpent.toLocaleString('en-IN')} of ₹${catBudget.toLocaleString('en-IN')}).`,
            type: 'critical',
            priority: 'high',
            channelType: 'budget',
            relatedFeature: 'category_budget',
            metadata: { category: cat, catSpent, catBudget, catPercent },
            smsText: SmsService.formatCategoryMessage({ category: cat, percent: 100, spent: catSpent, budget: catBudget, overAmount: catOver })
          });
        }
      }

      // ========================================================
      // 7. Intelligent Unusual Spending & Anomaly Detection
      // ========================================================
      if (currentExpense && (action === 'create' || action === 'update') && prefs.unusualSpendingAlerts !== false) {
        const anomaly = AnomalyService.detectAnomaly(user, currentExpense);
        if (anomaly && anomaly.isAnomaly) {
          alertsToTrigger.push({
            title: anomaly.title || 'Unusual Spending Detected',
            message: anomaly.message,
            type: anomaly.severity === 'critical' ? 'critical' : 'warning',
            priority: anomaly.severity || 'high',
            channelType: 'unusual',
            relatedFeature: 'anomaly',
            metadata: {
              expenseId: currentExpense._id || currentExpense.id,
              amount: currentExpense.amount,
              description: currentExpense.description,
              category: currentExpense.category,
              details: anomaly.details
            },
            smsText: SmsService.formatAnomalyMessage({
              amount: currentExpense.amount,
              description: currentExpense.description || currentExpense.category
            })
          });
        }
      }

      // ========================================================
      // 8. Dispatch Multi-Channel Notifications
      // ========================================================
      const createdNotifications = [];
      const smsResults = [];
      const pushResults = [];
      const emailResults = [];

      for (const alert of alertsToTrigger) {
        // A. In-App Notification (Stored in MongoDB)
        if (prefs.inAppAlerts !== false) {
          try {
            const notif = new Notification({
              userId: user._id,
              title: alert.title,
              message: alert.message,
              type: alert.type,
              priority: alert.priority,
              isRead: false,
              relatedFeature: alert.relatedFeature,
              metadata: alert.metadata || {}
            });
            await notif.save();
            createdNotifications.push(notif);
          } catch (notifErr) {
            console.error('[SpendingAlertService] Error saving in-app notification:', notifErr.message);
          }
        }

        // B. Real SMS Spending Alert (Respecting master & granular preferences)
        const isSmsEnabled = prefs.smsAlerts === true && user.phoneNumber;
        let canSendSms = false;

        if (isSmsEnabled) {
          if (alert.channelType === 'budget' && prefs.smsBudgetAlerts !== false) {
            canSendSms = true;
          } else if (alert.channelType === 'daily' && prefs.smsDailyAlerts !== false) {
            canSendSms = true;
          } else if (alert.channelType === 'unusual' && prefs.smsUnusualAlerts !== false) {
            canSendSms = true;
          } else if (!alert.channelType) {
            canSendSms = true;
          }
        }

        if (canSendSms) {
          try {
            const smsRes = await SmsService.sendSpendingAlert(user.phoneNumber, alert.smsText || alert.message);
            smsResults.push(smsRes);
          } catch (smsErr) {
            console.warn('[SpendingAlertService] SMS dispatch warning:', smsErr.message);
          }
        }

        // C. Optional Email Alert (Strictly only when user enabled email budget alerts)
        if (prefs.emailAlerts === true && prefs.emailBudgetAlerts === true && user.email && (alert.priority === 'critical' || alert.priority === 'high')) {
          try {
            const emailRes = await SendMail({
              email: user.email,
              subject: `Arua Finance — ${alert.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070b14; color: #fff; padding: 24px; border-radius: 12px;">
                  <h2 style="color: #38bdf8; margin-top: 0;">Arua Finance Financial Alert</h2>
                  <p style="font-size: 14px; color: #cbd5e1;">Hi ${user.name || "Investor"},</p>
                  <div style="background: #0f172a; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 16px 0;">
                    <p style="margin: 0; font-size: 15px; font-weight: bold; color: #f87171;">${alert.title}</p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">${alert.message}</p>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">This notification was sent based on your email preferences in Arua Finance.</p>
                </div>
              `
            });
            emailResults.push(emailRes);
          } catch (mailErr) {
            console.warn('[SpendingAlertService] Email alert dispatch warning:', mailErr.message);
          }
        }
      }

      // 9. Save updated triggered alerts tracking to User document
      user.markModified('triggeredAlerts');
      await user.save();

      return {
        alertSummary: alertsToTrigger,
        createdNotifications,
        smsResults,
        emailResults
      };
    } catch (pipelineErr) {
      console.error('[SpendingAlertService] Unexpected error in alert pipeline:', pipelineErr);
      return { alertSummary: [], createdNotifications: [], smsResults: [] };
    }
  }
}

export default SpendingAlertService;
