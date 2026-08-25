import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate AI-based financial advice using Gemini
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
  apiKey,
  customPrompt = ""
}) {
  const riskProfile = getRisk(age, annualIncome, monthlyExpense, savings, riskTolerance);

  const formattedProfile = `
👤 User Profile:
- Age: ${age}
- Annual Income: ₹${annualIncome.toLocaleString()}
- Monthly Expense: ₹${monthlyExpense.toLocaleString()}
- Total Savings: ₹${savings.toLocaleString()}
- Investment Horizon: ${investmentHorizon} years
- Financial Goal: ${financialGoal}
- Preferred Assets: ${preferredAssets}
- Self-assessed Risk Tolerance: ${riskTolerance}
- AI-assessed Risk Profile: ${riskProfile}
`;

  const baseInstruction = `
  You are a certified financial advisor. Based on the following user profile, provide **10–15 lines** of **personalized, actionable financial advice** in markdown format. Include:

- Recommended asset types (e.g., mutual funds, stocks, bonds, gold, real estate)
- Suggested allocation in % (e.g., 40% mutual funds, 30% stocks)
- Clear reasoning behind each choice based on user's profile
- Advice should be practical and beginner-friendly
- Do not repeat the user profile in the response
`;
  const finalPrompt = `${baseInstruction}\n\n${formattedProfile}\n\n${customPrompt ? `\n🧠 Focus Topic: ${customPrompt}` : ""}`;

  try {
    if (!apiKey) {
      return { ok: false, error: "Gemini API key is missing. Please set VITE_GeminiAPI in your .env file." };
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text().trim();

    return {
      ok: true,
      advice: `${text} ${formattedProfile}`,
      risk: riskProfile,
      profile: formattedProfile.trim()
    };
  } catch (e) {
    return { ok: false, error: e.message || "Something went wrong" };
  }
}

/**
 * Basic risk scoring based on age, expense ratio, savings, and user tolerance
 */
function getRisk(age, income, expense, savings, tolerance) {
  let score = age < 30 ? 3 : age < 50 ? 2 : 1;
  const monthlyIncome = income / 12;
  const ratio = monthlyIncome ? expense / monthlyIncome : 1;

  score += ratio < 0.5 ? 3 : ratio < 0.75 ? 2 : 1;
  score += savings > income * 2 ? 3 : savings > income ? 2 : 1;
  score += { low: 1, medium: 2, high: 3 }[tolerance?.toLowerCase()] || 2;

  return score >= 10 ? "High" : score >= 7 ? "Medium" : "Low";
}
