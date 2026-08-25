import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, ChevronDown, Check, Lightbulb, Zap, IndianRupee } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import useChatBotGemini from "./ChatBotGemini";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const QUICK_PROMPTS = [
  "💡 Analyze my monthly budget in ₹",
  "📈 Best 5-year SIP portfolio strategy",
  "🧮 How to maximize FY 2025-26 tax savings?",
  "🛡️ Emergency reserve fund calculation"
];

export default function ChatButton() {
  const { chatBotMessages, setChatBotMessages, sendMessage } = useChatBotGemini();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current && isChatOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatBotMessages, isChatOpen, isLoading]);

  useEffect(() => {
    if (isChatOpen) {
      setHasNewMessage(false);
    }
  }, [isChatOpen]);

  const handleSendMessage = async (textToSend) => {
    const prompt = typeof textToSend === "string" ? textToSend : message;
    if (!prompt.trim() || !sendMessage || isLoading) return;

    setIsLoading(true);
    setMessage("");

    try {
      await sendMessage(prompt.trim());
    } catch (error) {
      console.error("Gemini AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating Glowing Trigger Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-50 gradient-bg text-white rounded-2xl p-3.5 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center space-x-2 border border-blue-400/30`}
        aria-label="Open Arua Finance AI Advisor"
      >
        <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
        <span className="text-xs font-extrabold tracking-wide pr-1 hidden sm:inline-block">Arua AI</span>
        {hasNewMessage && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 border-2 border-[#070b14]"></span>
          </span>
        )}
      </button>

      {/* Floating Chat Assistant Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-[#0c1222] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 animate-slide-up text-slate-100">
          {/* Header */}
          <div className="gradient-bg text-white p-4 flex justify-between items-center shadow-md border-b border-blue-500/30">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  Arua Finance AI
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-blue-100/90 font-medium">Smarter Money. Powered by AI.</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.replace(/^[^\w\s]+/, '').trim())}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-blue-500/40 font-medium transition-all shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080d1a]" ref={chatContainerRef}>
            {chatBotMessages.map((chatMessage, index) => (
              <div
                key={index}
                className={`flex ${chatMessage.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[85%] space-x-2">
                  {chatMessage.role === "model" && (
                    <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        chatMessage.role === "user"
                          ? "gradient-bg text-white rounded-tr-xs shadow-md shadow-blue-600/20 border border-blue-400/30"
                          : "bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-xs shadow-sm"
                      }`}
                    >
                      {chatMessage.role === "user" ? (
                        <p>{chatMessage.text}</p>
                      ) : (
                        <div className="prose prose-invert prose-xs max-w-none text-slate-200">
                          <Markdown remarkPlugins={[remarkGfm]}>{chatMessage.text}</Markdown>
                        </div>
                      )}
                    </div>
                    {chatMessage.timestamp && (
                      <p className="text-[10px] text-slate-500 mt-1 px-1">
                        {formatTime(chatMessage.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start space-x-2">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <div className="flex items-center space-x-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Arua Finance AI in ₹..."
                className="min-h-[42px] max-h-[100px] flex-1 resize-none text-xs sm:text-sm rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 py-2.5 px-3"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                className="gradient-bg text-white h-10 w-10 p-0 rounded-xl hover:scale-105 shrink-0 shadow-md shadow-blue-500/20 border border-blue-400/30"
                disabled={!message.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
