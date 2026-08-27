import { GoogleGenerativeAI } from "@google/generative-ai";

function formatINR(val) {
  const num = Number(val) || 0;
  return "₹" + num.toLocaleString("en-IN");
}

export class AIService {
  static getClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GeminiAPI;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Calculates comprehensive Financial Health Score (0-100) based on real user data
   */
  static calculateHealthScore(user) {
    if (!user) {
      return {
        overallScore: 50,
        status: "Needs Attention",
        color: "amber",
        pillars: {},
        summary: "No financial telemetry available."
      };
    }

    const annualIncome = Number(user.annualIncome) || 500000;
    const monthlyIncome = annualIncome / 12;
    const monthlyBudget = Number(user.monthlyBudget) || monthlyIncome * 0.6;
    const monthlyExpense = Number(user.monthlyExpense) || 20000;
    const savings = Number(user.savings) || 50000;
    const expenses = user.expenses || [];
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const goals = user.goals || [];

    // 1. Savings Rate Score (Max 25 pts)
    // Target: Saving at least 20-30% of monthly income
    const monthlySavings = Math.max(0, monthlyIncome - (totalExpenses || monthlyExpense));
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    let savingsScore = Math.min(25, Math.round((savingsRate / 30) * 25));

    // 2. Budget Discipline Score (Max 20 pts)
    // Spending <= 85% of monthly budget
    let budgetScore = 20;
    if (monthlyBudget > 0 && totalExpenses > 0) {
      const budgetBurn = (totalExpenses / monthlyBudget) * 100;
      if (budgetBurn <= 80) budgetScore = 20;
      else if (budgetBurn <= 100) budgetScore = 15;
      else if (budgetBurn <= 120) budgetScore = 8;
      else budgetScore = 3;
    }

    // 3. Emergency Fund Score (Max 20 pts)
    // Target: 6 months of monthly expenses
    const targetEmergencyFund = Math.max(1, monthlyExpense * 6);
    const emergencyRatio = (savings / targetEmergencyFund) * 100;
    let emergencyScore = Math.min(20, Math.round((emergencyRatio / 100) * 20));

    // 4. Investment & Horizon Score (Max 15 pts)
    const horizon = Number(user.investmentHorizon) || 3;
    let investmentScore = 10;
    if (horizon >= 5) investmentScore = 15;
    else if (horizon >= 3) investmentScore = 12;
    else if (horizon >= 1) investmentScore = 8;

    // 5. Goal Progress Score (Max 10 pts)
    let goalsScore = 5;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((acc, g) => {
        const target = Number(g.targetAmount) || 1;
        const curr = Number(g.currentAmount) || 0;
        return acc + Math.min(100, (curr / target) * 100);
      }, 0) / goals.length;
      goalsScore = Math.min(10, Math.round((avgProgress / 100) * 10));
    }

    // 6. Tax Planning & Asset Allocation (Max 10 pts)
    let taxScore = user.riskTolerance === "High" ? 10 : user.riskTolerance === "Medium" ? 8 : 7;

    const overallScore = Math.max(10, Math.min(100, savingsScore + budgetScore + emergencyScore + investmentScore + goalsScore + taxScore));

    let status = "Needs Attention";
    let color = "amber";
    let message = "Your financial health is stable but has key optimization opportunities.";

    if (overallScore >= 80) {
      status = "Excellent";
      color = "emerald";
      message = "Outstanding financial discipline! You have strong savings and high wealth creation momentum.";
    } else if (overallScore >= 65) {
      status = "Good";
      color = "blue";
      message = "Healthy financial foundation. Increasing your emergency cushion and investment rate will push you to Excellent.";
    } else if (overallScore < 45) {
      status = "At Risk";
      color = "rose";
      message = "High burn rate detected. Focus on reducing discretionary spending and creating a minimum emergency buffer.";
    }

    return {
      overallScore,
      status,
      color,
      message,
      savingsRate: savingsRate.toFixed(1),
      pillars: {
        savingsRate: { score: savingsScore, max: 25, label: "Savings Rate", value: `${savingsRate.toFixed(1)}% of income` },
        budgetDiscipline: { score: budgetScore, max: 20, label: "Budget Discipline", value: `${(totalExpenses > 0 ? (totalExpenses / (monthlyBudget || 1)) * 100 : 0).toFixed(0)}% burn` },
        emergencyReserve: { score: emergencyScore, max: 20, label: "Emergency Reserve", value: `${(emergencyRatio).toFixed(0)}% of 6-mo target` },
        wealthHorizon: { score: investmentScore, max: 15, label: "Wealth Horizon", value: `${horizon} Year Plan` },
        goalTracking: { score: goalsScore, max: 10, label: "Goal Momentum", value: `${goals.length} active goal(s)` },
        taxAssetMix: { score: taxScore, max: 10, label: "Tax & Asset Mix", value: user.riskTolerance || "Medium" }
      }
    };
  }

  /**
   * AI Money Coach Chat with injected real user financial telemetry
   */
  static async coachChat(user, userMessage, chatHistory = []) {
    const genAI = this.getClient();
    if (!genAI) {
      return "AI Money Coach is currently offline. Please check GEMINI_API_KEY.";
    }

    const health = this.calculateHealthScore(user);
    const annualIncome = Number(user.annualIncome) || 500000;
    const monthlyIncome = annualIncome / 12;
    const monthlyBudget = Number(user.monthlyBudget) || 30000;
    const savings = Number(user.savings) || 50000;
    const expenses = user.expenses || [];
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Group expenses by category
    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || "General";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["None", 0];

    const goalsSummary = (user.goals || []).map(g => `${g.name}: ${formatINR(g.currentAmount)} / ${formatINR(g.targetAmount)} (Contrib: ${formatINR(g.monthlyContribution)}/mo)`).join(", ") || "No active goals yet";

    const systemInstruction = `
You are the personal AI Money Coach at Arua Finance ("Smarter Money. Powered by AI.").
You are advising the following user in India:

USER FINANCIAL TELEMETRY:
- Name: ${user.name || user.firstName || "Investor"}
- Annual Income: ${formatINR(annualIncome)} (Approx ${formatINR(Math.round(monthlyIncome))}/month)
- Current Monthly Budget: ${formatINR(monthlyBudget)}
- Total Logged Expenses: ${formatINR(totalExpenses)} across ${expenses.length} transaction(s)
- Top Spending Category: ${topCategory[0]} (${formatINR(topCategory[1])})
- Category Breakdown: ${JSON.stringify(categoryTotals)}
- Liquid Savings: ${formatINR(savings)}
- Financial Health Score: ${health.overallScore}/100 (${health.status})
- Active Financial Goals: ${goalsSummary}
- Risk Tolerance: ${user.riskTolerance || "Medium"}
- Investment Horizon: ${user.investmentHorizon || 3} Years

GUIDELINES:
1. Always anchor your answers directly in the user's real numbers above (e.g. mention their actual income, expenses, top category, or budget buffer).
2. Answer the specific question directly:
   - "Where did I spend the most this month?" -> State the top category and amount, and compare to their budget.
   - "How can I save more money?" -> Identify specific categories with high burn and suggest targeted rupee reductions.
   - "Can I afford to invest ₹X?" -> Check their monthly surplus (${formatINR(Math.round(monthlyIncome - totalExpenses))}) and confirm affordability with a concrete recommendation.
   - "What is affecting my Health Score?" -> Break down their score (${health.overallScore}/100) and point out which pillar needs attention.
3. Use Indian Rupees (₹) and Indian numerical formatting (e.g. ₹50,000, ₹1,25,000, ₹10,00,000).
4. Keep answers concise, highly motivating, professional, and formatted in clear bullet points or short paragraphs.
    `;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-lite-latest",
        systemInstruction,
        generationConfig: { temperature: 0.2 }
      });

      const contents = [
        ...chatHistory.map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        })),
        { role: "user", parts: [{ text: userMessage }] }
      ];

      const response = await model.generateContent({ contents });
      return response.response.text();
    } catch (error) {
      console.error("AI Coach Gemini error:", error);
      return "I encountered an issue analyzing your live financial records. Please try asking again.";
    }
  }

  /**
   * Generates a comprehensive Monthly AI Financial Report
   */
  static async generateMonthlyReport(user) {
    const health = this.calculateHealthScore(user);
    const annualIncome = Number(user.annualIncome) || 500000;
    const monthlyIncome = annualIncome / 12;
    const monthlyBudget = Number(user.monthlyBudget) || 30000;
    const savings = Number(user.savings) || 50000;
    const expenses = user.expenses || [];
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const surplus = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((surplus > 0 ? surplus : 0) / monthlyIncome) * 100 : 0;

    // Detect anomalies
    const anomalies = [];
    if (monthlyBudget > 0 && totalExpenses > monthlyBudget) {
      anomalies.push(`Budget Overrun: Total spending exceeds planned budget by ${formatINR(totalExpenses - monthlyBudget)}.`);
    }
    if (sortedCategories[0] && sortedCategories[0][1] > monthlyIncome * 0.4) {
      anomalies.push(`High Concentration: ${sortedCategories[0][0]} accounts for over 40% of total monthly income.`);
    }
    if (savings < (Number(user.monthlyExpense) || 20000) * 3) {
      anomalies.push(`Emergency Cushion Alert: Liquid savings are below the 3-month baseline safety reserve.`);
    }

    const genAI = this.getClient();
    let aiInsightsText = "";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
        const prompt = `
Generate a 3-point high-impact executive financial action plan for next month for an Indian investor with:
- Monthly Income: ${formatINR(Math.round(monthlyIncome))}
- Monthly Spending: ${formatINR(totalExpenses)}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Health Score: ${health.overallScore}/100
- Top Spending Category: ${sortedCategories[0] ? `${sortedCategories[0][0]} (${formatINR(sortedCategories[0][1])})` : "General"}
- Anomalies: ${anomalies.join("; ") || "None"}

Provide 3 numbered, concrete, highly actionable recommendations for next month.
        `;
        const res = await model.generateContent(prompt);
        aiInsightsText = res.response.text();
      } catch (e) {
        aiInsightsText = `1. Reallocate ${formatINR(Math.round(monthlyIncome * 0.1))} into a recurring SIP.\n2. Cap discretionary category spending to increase monthly buffer.\n3. Build your emergency reserve to reach 6 months of living expenses.`;
      }
    } else {
      aiInsightsText = `1. Reallocate ${formatINR(Math.round(monthlyIncome * 0.1))} into a recurring SIP.\n2. Cap discretionary category spending to increase monthly buffer.\n3. Build your emergency reserve to reach 6 months of living expenses.`;
    }

    return {
      generatedAt: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" }),
      userName: user.name || user.firstName || "Investor",
      monthlyIncome: Math.round(monthlyIncome),
      totalExpenses,
      surplus: Math.max(0, surplus),
      savingsRate: savingsRate.toFixed(1),
      savings,
      healthScore: health.overallScore,
      healthStatus: health.status,
      categoryBreakdown: sortedCategories.map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0
      })),
      goalsCount: (user.goals || []).length,
      anomalies: anomalies.length > 0 ? anomalies : ["No critical financial anomalies detected this period."],
      aiActionPlan: aiInsightsText
    };
  }

  /**
   * Generates dynamic, personalized AI recommendation cards based on real user data
   */
  static async generateDynamicRecommendations(user) {
    const health = this.calculateHealthScore(user);
    const annualIncome = Number(user.annualIncome) || 500000;
    const monthlyIncome = annualIncome / 12;
    const monthlyBudget = Number(user.monthlyBudget) || 30000;
    const savings = Number(user.savings) || 50000;
    const expenses = user.expenses || [];
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const riskTolerance = user.riskTolerance || "Medium";

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] || null;

    const cards = [];

    // 1. Emergency Fund Card
    const target6Months = (Number(user.monthlyExpense) || 20000) * 6;
    const emergencyShortfall = Math.max(0, target6Months - savings);
    if (emergencyShortfall > 0) {
      cards.push({
        type: "Emergency Reserve Fund",
        description: `Build a 6-month liquid cushion of ${formatINR(target6Months)}. Current shortfall: ${formatINR(emergencyShortfall)}.`,
        allocation: "15-20% of monthly income",
        risk: "Low",
        color: "bg-emerald-600",
        priority: "High",
        aiAdvice: `Prioritize liquid savings in high-interest savings accounts or sweep-in FDs until your balance reaches ${formatINR(target6Months)}.`
      });
    } else {
      cards.push({
        type: "Emergency Reserve Shield",
        description: `Your emergency fund of ${formatINR(savings)} is fully funded for 6+ months of living expenses.`,
        allocation: "Maintain reserve",
        risk: "Low",
        color: "bg-emerald-600",
        priority: "Low",
        aiAdvice: "Emergency readiness is optimal! You can deploy remaining monthly surpluses into higher-yield equity SIPs."
      });
    }

    // 2. SIP Portfolio Card
    const recommendedSip = Math.round(monthlyIncome * (riskTolerance === "High" ? 0.30 : riskTolerance === "Medium" ? 0.20 : 0.15));
    cards.push({
      type: "Systematic Investment Plan (SIP)",
      description: `Invest ${formatINR(recommendedSip)}/month in diversified index and flexi-cap mutual funds.`,
      allocation: `${riskTolerance === "High" ? "30%" : riskTolerance === "Medium" ? "20%" : "15%"} of monthly income`,
      risk: riskTolerance,
      color: "bg-blue-600",
      priority: "High",
      aiAdvice: `A recurring monthly SIP of ${formatINR(recommendedSip)} at an estimated 12-14% CAGR can build a significant compounding corpus over 5-10 years.`
    });

    // 3. Tax Saving Card (80C / ELSS / PPF)
    cards.push({
      type: "Tax-Saving ELSS & PPF",
      description: `Allocate up to ${formatINR(150000)} annually across Section 80C instruments for tax deduction & wealth creation.`,
      allocation: "₹12,500 / month",
      risk: "Medium",
      color: "bg-cyan-600",
      priority: "Medium",
      aiAdvice: "If opting for the Old Tax Regime, maxing out your Section 80C limit saves up to ₹46,800 in taxes at the 30% slab."
    });

    // 4. Overspending Alert Card (if any top category exceeds 35% of income or budget is exceeded)
    if (topCategory && topCategory[1] > monthlyIncome * 0.35) {
      cards.push({
        type: `Spending Discipline: ${topCategory[0]}`,
        description: `${topCategory[0]} spending (${formatINR(topCategory[1])}) accounts for a large portion of your monthly cash flow.`,
        allocation: `Aim to cap under ${formatINR(Math.round(monthlyIncome * 0.25))}`,
        risk: "Low",
        color: "bg-amber-600",
        priority: "High",
        aiAdvice: `Trimming ${topCategory[0]} by 15% will free up approximately ${formatINR(Math.round(topCategory[1] * 0.15))} every month for your financial goals.`
      });
    }

    // 5. Goal Acceleration Card
    const goals = user.goals || [];
    if (goals.length > 0) {
      const activeGoal = goals[0];
      const target = Number(activeGoal.targetAmount) || 1;
      const curr = Number(activeGoal.currentAmount) || 0;
      const gap = Math.max(0, target - curr);
      cards.push({
        type: `Goal Momentum: ${activeGoal.name}`,
        description: `${formatINR(curr)} saved of ${formatINR(target)} target (${Math.min(100, Math.round((curr / target) * 100))}% complete).`,
        allocation: activeGoal.monthlyContribution ? `${formatINR(activeGoal.monthlyContribution)}/mo` : "Custom SIP",
        risk: "Medium",
        color: "bg-purple-600",
        priority: "Medium",
        aiAdvice: gap > 0 ? `To achieve this milestone on time, contribute consistently each month to close the ${formatINR(gap)} remaining gap.` : "Milestone achieved!"
      });
    }

    return cards;
  }
}
