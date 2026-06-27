import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { MessageSquare, X, Send, Leaf, Sparkles } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Can I recycle lithium batteries?',
  'How should I erase my laptop before recycling?',
  'Is my phone repairable?',
  'What happens after recycling?',
];

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Hello! I'm your Eco-Assistant. I can help with e-waste disposal, data wiping, and battery safety. Ask me anything!", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await api.sendMessage(text);
      setMessages(prev => [...prev, { text: reply, isBot: true }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't reach the AI engine. Please verify the backend is running.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/10 animate-levitate animate-quantum"
          title="Consult Eco-Assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat window panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-2xl glass-panel border border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-2xl animate-orbit-in animate-quantum">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Leaf size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Eco-Assistant</h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles size={8} /> Powered by Gemini AI
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Log (Scrollable) */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed
                    ${m.isBot ? 'bg-[#0f172a] border border-white/5 text-gray-300 rounded-tl-sm' : 'bg-emerald-500 text-black font-semibold rounded-tr-sm'}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Loading typing bubble */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0f172a] border border-white/5 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={scrollRef}></div>
          </div>

          {/* Preset Buttons + Inputs Footer */}
          <div className="p-4 border-t border-white/10 space-y-3.5 bg-black/40">
            
            {/* Suggestions list */}
            {messages.length === 1 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Suggested topics:</span>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUERIES.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-[11px] text-emerald-400 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-pointer font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about electronics recycling..."
                className="flex-grow px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-500 disabled:opacity-50 text-black flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
