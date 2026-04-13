import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api";

const SUGGESTIONS = [
  "Find me a sedan under ₹8 lakhs",
  "Compare Honda City vs Maruti Ciaz",
  "Calculate EMI for ₹12L car",
  "Best fuel-efficient cars in 2024",
  "SUVs with 7 seats under ₹15L",
  "How to check car history in India?",
];

const QUICK_FILTERS = ["Sedan", "SUV", "Hatchback", "EV", "Luxury", "Under ₹5L"];

let msgId = 0;
const initialMessages = [
  {
    id: msgId++,
    role: "bot",
    text: "Hello! I'm CarBot AI 🚗 I can help you find your perfect car, compare models, calculate EMI, or answer any car-related questions. What are you looking for today?",
    time: new Date(),
  },
];

export default function ChatbotPage() {
  const [messages,     setMessages]     = useState(initialMessages);
  const [input,        setInput]        = useState("");
  const [typing,       setTyping]       = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || typing) return;
    setInput("");

    setMessages((prev) => [...prev, { id: msgId++, role: "user", text: userText, time: new Date() }]);
    setTyping(true);

    try {
      const res = await sendChatMessage(userText);
      setMessages((prev) => [...prev, { id: msgId++, role: "bot", text: res.data.reply, time: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { id: msgId++, role: "bot", text: "Sorry, something went wrong. Please try again.", time: new Date() }]);
    } finally {
      setTyping(false);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .chatbot-root { min-height: 100vh; background: #080808; font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; color: #fff; position: relative; overflow: hidden; padding-top: 70px; }
        .chatbot-root::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse 60% 40% at 80% 10%, rgba(245, 158, 11, 0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 10% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 50%); pointer-events: none; z-index: 0; }
        .chatbot-header { position: sticky; top: 0; z-index: 100; background: rgba(8,8,8,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(245,158,11,0.12); padding: 0 24px; height: 70px; display: flex; align-items: center; justify-content: space-between; }
        .header-left { display: flex; align-items: center; gap: 14px; }
        .bot-avatar-header { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b, #92400e); display: flex; align-items: center; justify-content: center; font-size: 22px; position: relative; box-shadow: 0 4px 20px rgba(245,158,11,0.3); }
        .bot-online-dot { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; border: 2px solid #080808; animation: pulse-green 2s infinite; }
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
        .bot-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: #fff; }
        .bot-name span { color: #f59e0b; }
        .bot-status { font-size: 12px; color: #22c55e; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .bot-status::before { content: ''; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }
        .header-btn { padding: 8px 16px; border-radius: 8px; font-family: 'DM Sans',sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
        .header-btn:hover { border-color: rgba(245,158,11,0.3); color: #f59e0b; background: rgba(245,158,11,0.06); }
        .chat-layout { display: flex; flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 24px 24px 0; gap: 24px; position: relative; z-index: 1; }
        .chat-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
        .panel-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; }
        .panel-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.3); margin-bottom: 14px; }
        .suggestion-btn { width: 100%; text-align: left; padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; color: rgba(255,255,255,0.65); font-family: 'DM Sans',sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; margin-bottom: 6px; display: block; }
        .suggestion-btn:hover { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: #f59e0b; transform: translateX(4px); }
        .filter-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin: 0 4px 8px 0; font-family: 'DM Sans',sans-serif; }
        .filter-chip:hover,.filter-chip.active { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: #f59e0b; }
        .stat-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .stat-row:last-child { border-bottom: none; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); }
        .stat-val { font-size: 14px; font-weight: 700; color: #f59e0b; }
        .chat-main { flex: 1; display: flex; flex-direction: column; min-height: calc(100vh - 140px); }
        .messages-area { flex: 1; overflow-y: auto; padding: 0 0 24px; display: flex; flex-direction: column; gap: 16px; }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 4px; }
        .msg-wrap { display: flex; gap: 12px; align-items: flex-end; animation: msgIn 0.3s ease; }
        @keyframes msgIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .msg-wrap.user { flex-direction: row-reverse; }
        .msg-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .msg-avatar.bot { background: linear-gradient(135deg,#f59e0b,#92400e); box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
        .msg-avatar.user { background: linear-gradient(135deg,#3b82f6,#1d4ed8); }
        .msg-bubble { max-width: 70%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
        .msg-bubble.bot { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px 16px 16px 16px; color: rgba(255,255,255,0.88); }
        .msg-bubble.user { background: linear-gradient(135deg,rgba(245,158,11,0.18),rgba(217,119,6,0.12)); border: 1px solid rgba(245,158,11,0.25); border-radius: 16px 4px 16px 16px; color: #fff; }
        .msg-time { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 5px; }
        .msg-time.bot { text-align: left; }
        .msg-time.user { text-align: right; }
        .typing-wrap { display: flex; gap: 12px; align-items: flex-end; animation: msgIn 0.3s ease; }
        .typing-bubble { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px 16px 16px 16px; padding: 14px 18px; display: flex; gap: 5px; align-items: center; }
        .typing-dot { width: 7px; height: 7px; background: #f59e0b; border-radius: 50%; animation: typingBounce 1.2s infinite; }
        .typing-dot:nth-child(2){animation-delay:0.2s} .typing-dot:nth-child(3){animation-delay:0.4s}
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }
        .input-area { position: sticky; bottom: 0; background: rgba(8,8,8,0.98); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.06); padding: 20px 24px 24px; }
        .input-row { display: flex; gap: 10px; align-items: flex-end; max-width: 800px; margin: 0 auto; }
        .input-box { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px 16px; color: #fff; font-family: 'DM Sans',sans-serif; font-size: 15px; resize: none; outline: none; transition: all 0.2s; min-height: 52px; max-height: 140px; line-height: 1.5; }
        .input-box::placeholder { color: rgba(255,255,255,0.25); }
        .input-box:focus { border-color: rgba(245,158,11,0.4); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(245,158,11,0.06); }
        .send-btn { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg,#f59e0b,#d97706); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.2s; flex-shrink: 0; box-shadow: 0 4px 15px rgba(245,158,11,0.3); }
        .send-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.5); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .input-hint { text-align: center; font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 10px; }
        @media(max-width:900px){.chat-sidebar{display:none}.chat-layout{padding:16px 16px 0}}
      `}</style>

      <div className="chatbot-root">
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-left">
            <div className="bot-avatar-header">🤖<div className="bot-online-dot" /></div>
            <div>
              <div className="bot-name">Car<span>Bot</span> AI</div>
              <div className="bot-status">Online · Powered by Gemini</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="header-btn" onClick={() => setMessages(initialMessages)}>🗑️ Clear Chat</button>
          </div>
        </div>

        {/* Layout */}
        <div className="chat-layout">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div className="panel-card">
              <div className="panel-title">Quick Suggestions</div>
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-btn" onClick={() => sendMessage(s)}>💬 {s}</button>
              ))}
            </div>

            <div className="panel-card">
              <div className="panel-title">Browse by Type</div>
              <div>
                {QUICK_FILTERS.map((f) => (
                  <button key={f} className={`filter-chip ${activeFilter === f ? "active" : ""}`}
                    onClick={() => { setActiveFilter(f); sendMessage(`Show me ${f} cars`); }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-title">Session Stats</div>
              <div className="stat-row"><span className="stat-label">Messages</span><span className="stat-val">{messages.length}</span></div>
              <div className="stat-row"><span className="stat-label">AI Model</span><span className="stat-val" style={{ fontSize: 11 }}>Gemini 2.0 Flash</span></div>
            </div>
          </div>

          {/* Chat Main */}
          <div className="chat-main">
            <div className="messages-area">
              {messages.map((msg) => (
                <div key={msg.id} className={`msg-wrap ${msg.role}`}>
                  <div className={`msg-avatar ${msg.role}`}>{msg.role === "bot" ? "🤖" : "👤"}</div>
                  <div>
                    <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>
                    <div className={`msg-time ${msg.role}`}>{formatTime(msg.time)}</div>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="typing-wrap">
                  <div className="msg-avatar bot">🤖</div>
                  <div className="typing-bubble">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="input-area">
              <div className="input-row">
                <textarea ref={inputRef} className="input-box"
                  placeholder="Ask me anything about cars... (e.g. 'Best SUVs under ₹15L')"
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  rows={1} />
                <button className="send-btn" onClick={() => sendMessage()} disabled={typing}>➤</button>
              </div>
              <div className="input-hint">Press Enter to send · Shift+Enter for new line · Powered by Google Gemini AI</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}