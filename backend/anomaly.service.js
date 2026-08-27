/**
 * Intelligent Anomaly & Unusual Spending Detection Service
 * Analyzes real historical user transactions to detect statistically significant outliers and spending surges.
 */

export class AnomalyService {
  /**
   * Evaluates whether an expense is an unusual outlier based on the user's historical transactions.
   * @param {Object} user - User document containing expense history and monthly budget
   * @param {Object} newExpense - The newly logged or edited expense { amount, description, category, date }
   * @returns {{ isAnomaly: boolean, severity?: string, title?: string, message?: string, details?: Object }}
   */
  static detectAnomaly(user, newExpense) {
    if (!user || !newExpense) return { isAnomaly: false };

    const amount = Number(newExpense.amount) || 0;
    if (amount <= 0) return { isAnomaly: false };

    const expenses = (user.expenses || []).map(e => ({
      amount: Number(e.amount) || 0,
      description: e.description || '',
      category: e.category || 'Other',
      date: new Date(e.date || Date.now())
    })).filter(e => e.amount > 0);

    // Require at least 4 previous historical transactions to avoid false alarms on new accounts
    if (expenses.length < 4) {
      // Check absolute single-transaction threshold relative to monthly budget
      const monthlyBudget = Number(user.monthlyBudget) || 0;
      if (monthlyBudget > 0 && amount >= monthlyBudget * 0.7 && amount >= 5000) {
        const percent = ((amount / monthlyBudget) * 100).toFixed(0);
        return {
          isAnomaly: true,
          severity: 'high',
          title: 'Unusual High-Value Expense',
          message: `A single expense of ₹${amount.toLocaleString('en-IN')} accounts for ${percent}% of your entire monthly budget.`,
          details: { amount, monthlyBudget, percentage: (amount / monthlyBudget) * 100 }
        };
      }
      return { isAnomaly: false };
    }

    // Exclude the current expense when calculating historical baseline
    const previousAmounts = expenses.slice(1).map(e => e.amount);
    if (previousAmounts.length < 3) return { isAnomaly: false };

    const sum = previousAmounts.reduce((a, b) => a + b, 0);
    const mean = sum / previousAmounts.length;

    const variance = previousAmounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / previousAmounts.length;
    const stdDev = Math.sqrt(variance);

    // Rule 1: Expense is at least 3x the average transaction AND at least ₹1,500
    const isOutlierRatio = amount >= Math.max(1500, mean * 3);

    // Rule 2: Expense exceeds mean + 2.5 standard deviations (statistically rare event, p < 0.01)
    const isStatisticalOutlier = stdDev > 0 && amount > (mean + 2.5 * stdDev) && amount >= 2000;

    // Rule 3: Category-specific outlier check
    const categoryExpenses = expenses.filter(e => e.category === newExpense.category && e.amount > 0).map(e => e.amount);
    let isCategoryOutlier = false;
    let categoryMean = 0;
    if (categoryExpenses.length >= 3) {
      categoryMean = categoryExpenses.reduce((a, b) => a + b, 0) / categoryExpenses.length;
      if (amount >= Math.max(2000, categoryMean * 3.5)) {
        isCategoryOutlier = true;
      }
    }

    if (isOutlierRatio || isStatisticalOutlier || isCategoryOutlier) {
      const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
      const formattedAvg = `₹${Math.round(mean).toLocaleString('en-IN')}`;
      const ratio = (amount / (mean || 1)).toFixed(1);

      let message = `A ${formattedAmount} transaction (${newExpense.description || newExpense.category}) is significantly higher than your typical average (${formattedAvg}, ${ratio}x higher).`;
      if (isCategoryOutlier) {
        message = `A ${formattedAmount} expense in ${newExpense.category} is unusually high compared to your typical ${newExpense.category} average of ₹${Math.round(categoryMean).toLocaleString('en-IN')}.`;
      }

      return {
        isAnomaly: true,
        severity: amount >= 10000 ? 'critical' : 'high',
        title: 'Unusual Spending Detected',
        message,
        details: {
          amount,
          average: Math.round(mean),
          category: newExpense.category,
          description: newExpense.description,
          ratio: parseFloat(ratio),
          stdDev: Math.round(stdDev)
        }
      };
    }

    // Rule 4: Rapid Spending Surge / Burst (multiple transactions in last 3 hours totaling > 45% of budget)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const recentExpenses = expenses.filter(e => e.date >= threeHoursAgo);
    const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0) + amount;
    const monthlyBudget = Number(user.monthlyBudget) || 0;

    if (recentExpenses.length >= 3 && monthlyBudget > 0 && recentTotal >= monthlyBudget * 0.45) {
      return {
        isAnomaly: true,
        severity: 'high',
        title: 'Rapid Spending Velocity Surge',
        message: `High spending velocity detected: ₹${recentTotal.toLocaleString('en-IN')} recorded across ${recentExpenses.length + 1} transactions in the last 3 hours.`,
        details: { recentTotal, count: recentExpenses.length + 1, monthlyBudget }
      };
    }

    return { isAnomaly: false };
  }
}

export default AnomalyService;
