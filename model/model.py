import os
import pandas as pd
import numpy as np
import google.generativeai as genai
from typing import Dict, Optional
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("api_key")

# # Configure Gemini API
# def configure_gemini(api_key: str) -> None:
#     """Configure the Gemini API with the provided API key."""
#     genai.configure(api_key="AIzaSyCSdvtDI7sALmQ7SpyR4wlQd7DH92UM7No")

# Collect user input
def collect_user_input() -> Dict:
    """Collect financial information from the user via command-line input."""
    print("=== Financial Advisor Input Form ===")
    user_data = {}
    user_data['age'] = int(input("Enter your age: "))
    user_data['annual_income'] = float(input("Enter your annual income ($): "))
    user_data['monthly_expenses'] = float(input("Enter your monthly expenses ($): "))
    user_data['savings'] = float(input("Enter your current savings ($): "))
    user_data['investment_horizon'] = int(input("Enter your investment horizon (years): "))
    user_data['risk_tolerance'] = input("Enter your risk tolerance (low/medium/high): ").lower()
    user_data['financial_goal'] = input("Enter your financial goal (e.g., retirement, home purchase): ")
    user_data['preferred_assets'] = input("Enter preferred asset types (e.g., stocks, bonds, real estate): ").split(',')
    return user_data

# Risk profiling
def assess_risk_tolerance(user_data: Dict) -> str:
    """Assess user's risk tolerance based on input data."""
    score = 0
    # Age-based scoring: younger users can take more risk
    if user_data['age'] < 30:
        score += 3
    elif user_data['age'] < 50:
        score += 2
    else:
        score += 1
    
    # Income-to-expenses ratio: higher ratio allows more risk
    monthly_income = user_data['annual_income'] / 12
    expense_ratio = user_data['monthly_expenses'] / monthly_income if monthly_income > 0 else 1
    if expense_ratio < 0.5:
        score += 3
    elif expense_ratio < 0.75:
        score += 2
    else:
        score += 1
    
    # Savings: more savings allows more risk
    if user_data['savings'] > user_data['annual_income'] * 2:
        score += 3
    elif user_data['savings'] > user_data['annual_income']:
        score += 2
    else:
        score += 1
    
    # Map user-reported risk tolerance
    risk_map = {'low': 1, 'medium': 2, 'high': 3}
    score += risk_map.get(user_data['risk_tolerance'], 2)
    
    # Determine risk profile
    if score >= 10:
        return "High"
    elif score >= 7:
        return "Medium"
    else:
        return "Low"

# Generate financial advice using Gemini API
def generate_financial_advice(user_data: Dict, risk_profile: str, api_key: str) -> str:
    """Generate personalized financial advice using Gemini API."""
    # configure_gemini(api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Craft prompt for Gemini
    prompt = f"""
    You are a financial advisor AI. Based on the following user profile, provide personalized financial advice. Ensure the advice is clear, concise, and tailored to the user's risk tolerance and financial goals. Avoid specific investment recommendations unless explicitly requested, and include a disclaimer about consulting a professional advisor.

    User Profile:
    - Age: {user_data['age']}
    - Annual Income: ${user_data['annual_income']}
    - Monthly Expenses: ${user_data['monthly_expenses']}
    - Current Savings: ${user_data['savings']}
    - Investment Horizon: {user_data['investment_horizon']} years
    - Risk Tolerance: {risk_profile}
    - Financial Goal: {user_data['financial_goal']}
    - Preferred Assets: {', '.join(user_data['preferred_assets'])}

    Provide a summary of the user's financial situation and suggest a general strategy for achieving their financial goal, considering their risk profile and preferred assets.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating advice: {str(e)}"

# Main function
def main():
    # Get your Gemini API key from the .env file
    API_KEY = os.getenv("GEMINI_API_KEY")
    
    # Collect user input
    user_data = collect_user_input()
    
    # Assess risk tolerance
    risk_profile = assess_risk_tolerance(user_data)
    print(f"\nAssessed Risk Profile: {risk_profile}")
    
    # Generate and display financial advice
    advice = generate_financial_advice(user_data, risk_profile, API_KEY)
    print("\n=== Personalized Financial Advice ===")
    print(advice)

if __name__ == "__main__":
    main()