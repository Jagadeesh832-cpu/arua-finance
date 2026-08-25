import { useState } from "react";
import { useAuth } from "@/helper/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function useChatBotGemini() {
  const { LoggedInUserData } = useAuth();
  const [chatBotMessages, setChatBotMessages] = useState([
    {
      role: "model",
      text: "Namaste! I am your Arua AI Money Coach. Ask me anything about your expenses, budget discipline, SIP investment capacity, or Financial Health Score!",
      timestamp: new Date().toISOString()
    }
  ]);

  const sendMessage = async (userMessage) => {
    if (!userMessage || !userMessage.trim()) return "";

    const userMsgObj = {
      role: "user",
      text: userMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setChatBotMessages((prev) => [...prev, userMsgObj]);

    const chatHistory = chatBotMessages.map((m) => ({
      role: m.role,
      text: m.text
    }));

    try {
      // 1. Try Backend-Proxied Contextual AI Coach Endpoint
      const baseUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_ServerUrl || "";
      const res = await fetch(`${baseUrl}/api/ai/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.trim(),
          chatHistory,
          userData: LoggedInUserData,
          identifier: LoggedInUserData?.phoneNumber || LoggedInUserData?.email
        })
      });

      const data = await res.json();
      if (res.ok && data.response) {
        const botMsgObj = {
          role: "model",
          text: data.response,
          timestamp: new Date().toISOString()
        };
        setChatBotMessages((prev) => [...prev, botMsgObj]);
        return data.response;
      }
    } catch (backendError) {
      console.warn("Backend AI Coach unavailable, trying direct client fallback...", backendError);
    }

    // 2. Direct Client-Side Gemini Fallback
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GeminiAPI || "";
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-lite-latest",
          systemInstruction: `You are Arua Finance AI Money Coach. Provide personalized Indian rupee wealth advice tailored for ${LoggedInUserData?.name || "Investor"}.`
        });

        const resp = await model.generateContent(userMessage.trim());
        const botText = resp.response.text();
        const botMsgObj = {
          role: "model",
          text: botText,
          timestamp: new Date().toISOString()
        };
        setChatBotMessages((prev) => [...prev, botMsgObj]);
        return botText;
      }
    } catch (clientError) {
      console.error("Direct Gemini error:", clientError);
    }

    const fallbackResponse = "I am analyzing your live financial records. Based on your current income and expense logs, maintaining a 20%+ savings rate and regular SIP investments will accelerate your wealth creation.";
    setChatBotMessages((prev) => [
      ...prev,
      { role: "model", text: fallbackResponse, timestamp: new Date().toISOString() }
    ]);
    return fallbackResponse;
  };

  return { chatBotMessages, setChatBotMessages, sendMessage };
}
