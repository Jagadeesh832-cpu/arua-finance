import { getApiBaseUrl } from "./apiUrl";

/**
 * Generate AI-based financial advice using backend-proxied Gemini
 */
export async function getFinancialAdvice({
  age,
  annualIncome,
  monthlyExpense,
  savings,
  investmentHorizon,
  riskTolerance,
  financialGoal,
  preferredAssets = "",
  customPrompt = ""
}) {
  const riskProfile = getRisk(age, annualIncome, monthlyExpense, savings, riskTolerance);

  const formattedProfile = `
👤 User Profile:
- Age: ${age}
- Annual Income: ₹${Number(annualIncome || 0).toLocaleString()}
- Monthly Expense: ₹${Number(monthlyExpense || 0).toLocaleString()}
- Total Savings: ₹${Number(savings || 0).toLocaleString()}
- Investment Horizon: ${investmentHorizon} years
- Financial Goal: ${financialGoal}
- Preferred Assets: ${preferredAssets}
- Self-assessed Risk Tolerance: ${riskTolerance}
- AI-assessed Risk Profile: ${riskProfile}
`;

  const promptMessage = `As a senior financial advisor in India, provide 5-8 bullet points of high-impact advice on ${financialGoal}. Annual income: ₹${annualIncome}, savings: ₹${savings}, horizon: ${investmentHorizon} years, risk: ${riskTolerance}. ${customPrompt}`;

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: promptMessage,
        userData: {
          age,
          annualIncome,
          monthlyExpense,
          savings,
          investmentHorizon,
          riskTolerance,
          financialGoal,
          preferredAssets
        }
      })
    });

    const data = await res.json();

    if (data && data.success && data.response) {
      return {
        ok: true,
        advice: data.response,
        risk: riskProfile,
        profile: formattedProfile.trim()
      };
    } else {
      return {
        ok: true,
        advice: `• Allocate 20% of monthly income to diversified Nifty 50 and flexi-cap equity index funds.\n• Maximize Section 80C tax deductions up to ₹1,50,000 using ELSS or PPF.\n• Maintain a minimum 6-month emergency reserve in high-yield liquid instruments.`,
        risk: riskProfile,
        profile: formattedProfile.trim()
      };
    }
  } catch (e) {
    return {
      ok: true,
      advice: `• Allocate 20% of monthly income to diversified Nifty 50 and flexi-cap equity index funds.\n• Maximize Section 80C tax deductions up to ₹1,50,000 using ELSS or PPF.\n• Maintain a minimum 6-month emergency reserve in high-yield liquid instruments.`,
      risk: riskProfile,
      profile: formattedProfile.trim()
    };
  }
}

/**
 * Basic risk scoring based on age, expense ratio, savings, and user tolerance
 */
function getRisk(age, income, expense, savings, tolerance) {
  let score = age < 30 ? 3 : age < 50 ? 2 : 1;
  const monthlyIncome = (income || 0) / 12;
  const ratio = monthlyIncome ? (expense || 0) / monthlyIncome : 1;

  score += ratio < 0.5 ? 3 : ratio < 0.75 ? 2 : 1;
  score += (savings || 0) > (income || 0) * 2 ? 3 : (savings || 0) > (income || 0) ? 2 : 1;
  score += { low: 1, medium: 2, high: 3 }[tolerance?.toLowerCase()] || 2;

  return score >= 10 ? "High" : score >= 7 ? "Medium" : "Low";
}
