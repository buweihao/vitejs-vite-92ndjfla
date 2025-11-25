import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { askOpticsExpert } from '../services/geminiService';

interface AIChatProps {
  language: Language;
}

const AIChat: React.FC<AIChatProps> = ({ language }) => {
  const isZh = language === 'zh';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Initialize welcome message when language changes or on mount
  useEffect(() => {
    const welcomeText = isZh 
      ? "你好！我是你的光学助教。关于打光角度、明暗视野或检测难题，尽管问我。"
      : "Hi! I'm your Optics Tutor. Ask me anything about lighting angles, reflection, or detection techniques.";
    
    // Reset or append welcome message when language changes significantly, 
    // but for simplicity, we just ensure there's at least one message or update the first if it's the only one.
    if (!initialized.current) {
        setMessages([{ role: 'model', text: welcomeText }]);
        initialized.current = true;
    }
  }, [isZh]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const answer = await askOpticsExpert(input, messages, language);
    
    setMessages(prev => [...prev, { role: 'model', text: answer }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center space-x-2">
        <Bot className="w-5 h-5 text-optics-accent" />
        <h3 className="font-bold text-slate-100">
          {isZh ? 'AI 光学顾问' : 'AI Optics Consultant'}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-optics-accent text-slate-900 rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-slate-800 p-3 rounded-lg rounded-bl-none border border-slate-700">
                    <Loader2 className="w-4 h-4 animate-spin text-optics-accent" />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isZh ? "例如：为什么低角度适合检测划痕？" : "Ex: Why is low angle good for scratches?"}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-optics-accent transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="p-2 bg-optics-accent text-slate-900 rounded-full hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;