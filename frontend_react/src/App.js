import React, { useEffect, useRef, useState } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * The root component for the Human-like Chatbot UI.
 * Features:
 * - Centered chat window with responsive minimalistic styling
 * - Header/Navigation bar
 * - Theme toggle (dark/light), dark by default
 * - Message display area with conversation history
 * - User input form
 * - Backend integration (REST: backend_chatbot)
 */
function App() {
  // Theme ('dark' by default)
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  // User input state
  const [input, setInput] = useState("");
  // Conversation history [{role: 'user'|'bot', content: string}]
  const [messages, setMessages] = useState([]);
  // API call loading state
  const [loading, setLoading] = useState(false);
  // Error state
  const [error, setError] = useState(null);
  // Scroll ref
  const messagesEndRef = useRef(null);

  // Update document theme on theme toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle user input submit
  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Update conversation (optimistic user message)
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setLoading(true);
    setError(null);

    try {
      // Backend endpoint - change based on deployment/proxy
      // You may want to set REACT_APP_BACKEND_URL in .env
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "/api";
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setMessages(prev =>
        [...prev, { role: "bot", content: data.reply || "..." }]
      );
    } catch (err) {
      setMessages(prev =>
        [...prev, { role: "bot", content: "Sorry, something went wrong." }]
      );
      setError("Backend unavailable or error.");
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleThemeToggle = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // PUBLIC_INTERFACE
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      handleSubmit(e);
    }
  };

  // PUBLIC_INTERFACE
  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="app-root">
      {/* HEADER */}
      <nav className="navbar">
        <span className="navbar-title">🤖 Human-like Chatbot</span>
        <div className="navbar-actions">
          <button
            className="theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={handleThemeToggle}
            type="button"
            data-testid="theme-toggle"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* CHAT WINDOW */}
      <main className="chat-outer">
        <section className="chat-window" aria-label="Chat window">
          {/* Conversation History */}
          <div className="chat-history" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>
                  <span className="empty-main">Welcome!</span>
                  <span className="empty-desc">
                    Start a conversation and observe human-like responses.
                  </span>
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.role === "user"
                    ? "chat-message chat-message-user"
                    : "chat-message chat-message-bot"
                }
                aria-label={msg.role === "user" ? "You" : "Chatbot"}
              >
                <div className="sender-label">
                  {msg.role === "user" ? "You" : "Bot"}
                </div>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* ERROR bar */}
          {error && <div className="chat-error">{error}</div>}

          {/* User Input Form */}
          <form className="chat-input-form" onSubmit={handleSubmit} autoComplete="off">
            <textarea
              className="chat-input"
              name="message"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={loading ? "Waiting for bot reply..." : "Type a message..."}
              rows={1}
              disabled={loading}
              required
              aria-label="User message"
            />
            <button
              className="send-btn"
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              {loading ? "..." : "Send"}
            </button>
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              title="Clear chat"
              aria-label="Clear conversation"
              disabled={messages.length === 0}
            >
              🗑
            </button>
          </form>
        </section>
      </main>
      {/* Credits/footer (optional) */}
      <footer className="footer">
        <span>
          Powered by <a href="https://kavia.ai" target="_blank" rel="noopener noreferrer" className="footer-link">KAVIA.AI</a>
        </span>
      </footer>
    </div>
  );
}

export default App;
