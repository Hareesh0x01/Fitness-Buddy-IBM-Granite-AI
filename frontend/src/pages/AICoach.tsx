import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatAPI, dashboardAPI } from '../services/api';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
  "Give me today's workout",
  "Suggest a healthy breakfast",
  "I have 20 minutes, what should I do?",
  "How can I stay consistent?",
  "Create a weekly fitness routine",
  "What should I eat after a workout?",
  "Give me a beginner workout",
  "How do I improve my stamina?",
  "I don't have gym equipment",
  "Give me motivation",
];

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<string>('');
  const [ibmConfigured, setIbmConfigured] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check IBM Granite status on mount
  useEffect(() => {
    dashboardAPI.getHealth().then((res) => {
      setIbmConfigured(res.data.ibmGraniteEnabled === true);
    }).catch(() => {
      setIbmConfigured(false);
    });
  }, []);

  // Welcome message
  useEffect(() => {
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Hello! I'm Fitness Buddy**, your AI-powered wellness and fitness coach!

I'm here to help you with:
- 💪 **Personalized workouts** based on your goals and equipment
- 🥗 **Nutrition advice** and healthy meal ideas
- 🎯 **Fitness planning** and goal setting
- 💡 **Motivation** and consistency tips
- 📋 **Weekly routines** tailored for you

**Try asking me:**
- "Give me a 20-minute beginner workout"
- "Suggest a healthy post-workout meal"
- "How do I build a fitness routine?"

*⚠️ Fitness Buddy provides general wellness information only. Always consult a qualified doctor, dietitian, or fitness professional for medical advice.*

What would you like to work on today? 🚀`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(async (messageText: string) => {
    const text = messageText.trim();
    if (!text || isLoading) return;

    setError('');
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await chatAPI.send(text, sessionId);
      const { message, sessionId: newSessionId, provider: p } = res.data;
      if (newSessionId) setSessionId(newSessionId);
      if (p) setProvider(p);
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Failed to send message.';
      setError(errorText);
      // Add error message as assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_err',
          role: 'assistant',
          content: `❌ **Connection Issue**\n\n${errorText}\n\nPlease check that the backend server is running and try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1)); // Remove last error message
      sendMessage(lastUserMsg.content);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)', maxHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Fitness Buddy AI</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ibmConfigured ? '#10b981' : '#f59e0b', display: 'inline-block' }}></span>
                {provider === 'ibm-granite' || ibmConfigured
                  ? 'Powered by IBM Granite ✨'
                  : ibmConfigured === false
                  ? 'Demo Mode'
                  : 'Connecting...'}
              </div>
            </div>
          </div>
          {(ibmConfigured === false && provider !== 'ibm-granite') && (
            <span className="badge badge-warning">⚠️ Demo Mode — Configure IBM Granite for full AI</span>
          )}
          {(provider === 'ibm-granite' || ibmConfigured === true) && (
            <span className="badge badge-success">✅ IBM Granite Active</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="fade-in"
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              flexShrink: 0,
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '75%', minWidth: '80px' }}>
              <div style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--bg-card)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                padding: '12px 16px',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
              }}>
                {msg.role === 'assistant' ? (
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>{children}</p>,
                        strong: ({ children }) => <strong style={{ color: 'var(--text-primary)' }}>{children}</strong>,
                        ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '8px 0', color: 'var(--text-secondary)' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '8px 0', color: 'var(--text-secondary)' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                        h2: ({ children }) => <h2 style={{ fontSize: '1rem', margin: '12px 0 6px', color: 'var(--primary-light)' }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontSize: '0.9rem', margin: '10px 0 4px', color: 'var(--primary-light)' }}>{children}</h3>,
                        code: ({ children }) => <code style={{ background: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>{children}</code>,
                        hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{msg.content}</p>
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="fade-in" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
              🤖
            </div>
            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fitness Buddy is thinking...</span>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-sm btn-secondary" onClick={handleRetry}>
              🔄 Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '8px 24px', borderTop: '1px solid var(--border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              className="btn btn-sm btn-secondary"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
              style={{ flexShrink: 0 }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Fitness Buddy anything... (Press Enter to send, Shift+Enter for new line)"
              className="form-textarea"
              style={{ minHeight: '48px', maxHeight: '120px', resize: 'none', paddingRight: '8px', lineHeight: 1.5 }}
              aria-label="Message input"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isLoading}
            style={{ padding: '12px 20px', flexShrink: 0 }}
            aria-label="Send message"
          >
            {isLoading ? <span className="spinner"></span> : '↑ Send'}
          </button>
        </form>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          ⚠️ General wellness information only. Not medical advice. Always consult qualified professionals.
        </p>
      </div>
    </div>
  );
}
