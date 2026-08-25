export function calculateHealthScore(userData) {
  if (!userData) {
    return {
      overallScore: 50,
      status: "Needs Attention",
      color: "amber",
      message: "Complete your profile to generate your Financial Health Score.",
      savingsRate: 0,
      pillars: {
        savingsRate: { score: 10, max: 25, label: "Savings Rate", value: "0% of income" },
        budgetDiscipline: { score: 10, max: 20, label: "Budget Discipline", value: "Not set" },
        emergencyReserve: { score: 10, max: 20, label: "Emergency Reserve", value: "Not set" },
        wealthHorizon: { score: 8, max: 15, label: "Wealth Horizon", value: "3 Years" },
        goalTracking: { score: 5, max: 10, label: "Goal Momentum", value: "0 goals" },
        taxAssetMix: { score: 7, max: 10, label: "Tax & Asset Mix", value: "Medium" }
      }
    };
  }

  const annualIncome = Number(userData.annualIncome) || 500000;
  const monthlyIncome = annualIncome / 12;
  const monthlyBudget = Number(userData.monthlyBudget) || monthlyIncome * 0.6;
  const monthlyExpense = Number(userData.monthlyExpense) || 20000;
  const savings = Number(userData.savings) || 50000;
  const expenses = userData.expenses || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const goals = userData.goals || [];

  // 1. Savings Rate Score (Max 25 pts)
  const monthlySavings = Math.max(0, monthlyIncome - (totalExpenses || monthlyExpense));
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  let savingsScore = Math.min(25, Math.round((savingsRate / 30) * 25));

  // 2. Budget Discipline Score (Max 20 pts)
  let budgetScore = 20;
  let budgetBurn = 0;
  if (monthlyBudget > 0 && totalExpenses > 0) {
    budgetBurn = (totalExpenses / monthlyBudget) * 100;
    if (budgetBurn <= 80) budgetScore = 20;
    else if (budgetBurn <= 100) budgetScore = 15;
    else if (budgetBurn <= 120) budgetScore = 8;
    else budgetScore = 3;
  }

  // 3. Emergency Reserve Score (Max 20 pts)
  const targetEmergencyFund = Math.max(1, (totalExpenses || monthlyExpense) * 6);
  const emergencyRatio = (savings / targetEmergencyFund) * 100;
  let emergencyScore = Math.min(20, Math.round((emergencyRatio / 100) * 20));

  // 4. Wealth Horizon & Investment (Max 15 pts)
  const horizon = Number(userData.investmentHorizon) || 3;
  let investmentScore = 10;
  if (horizon >= 5) investmentScore = 15;
  else if (horizon >= 3) investmentScore = 12;
  else if (horizon >= 1) investmentScore = 8;

  // 5. Goal Momentum (Max 10 pts)
  let goalsScore = 4;
  if (goals.length > 0) {
    const avgProgress = goals.reduce((acc, g) => {
      const target = Number(g.targetAmount) || 1;
      const curr = Number(g.currentAmount) || 0;
      return acc + Math.min(100, (curr / target) * 100);
    }, 0) / goals.length;
    goalsScore = Math.min(10, Math.max(4, Math.round((avgProgress / 100) * 10)));
  }

  // 6. Tax & Asset Mix (Max 10 pts)
  let taxScore = userData.riskTolerance === "High" ? 10 : userData.riskTolerance === "Medium" ? 8 : 7;

  const overallScore = Math.max(10, Math.min(100, savingsScore + budgetScore + emergencyScore + investmentScore + goalsScore + taxScore));

  let status = "Needs Attention";
  let color = "amber";
  let message = "Your financial health is stable. Increasing your monthly savings rate will accelerate wealth.";

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
    message = "High expense burn detected. Focus on reducing discretionary spending and building a 3-month emergency buffer.";
  }

  return {
    overallScore,
    status,
    color,
    message,
    savingsRate: savingsRate.toFixed(1),
    pillars: {
      savingsRate: { score: savingsScore, max: 25, label: "Savings Rate", value: `${savingsRate.toFixed(1)}% of income` },
      budgetDiscipline: { score: budgetScore, max: 20, label: "Budget Discipline", value: `${budgetBurn > 0 ? budgetBurn.toFixed(0) : "0"}% burn` },
      emergencyReserve: { score: emergencyScore, max: 20, label: "Emergency Reserve", value: `${emergencyRatio.toFixed(0)}% of 6-mo target` },
      wealthHorizon: { score: investmentScore, max: 15, label: "Wealth Horizon", value: `${horizon} Year Horizon` },
      goalTracking: { score: goalsScore, max: 10, label: "Goal Momentum", value: `${goals.length} active goal(s)` },
      taxAssetMix: { score: taxScore, max: 10, label: "Tax & Asset Mix", value: userData.riskTolerance || "Medium" }
    }
  };
}
