import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { analyzeData, AiResponse } from '../services/geminiService';
import { AggregatedStats } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: {
    currentLevel: string;
    stats: AggregatedStats;
    topSpenders: any[];
    monthlyTrends: any[];
    availableEntities?: any[];
  };
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  chart?: AiResponse['chart'];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your FinOps & Security assistant. I can visualize data for you. Try asking "Show me spend by provider" or "What is the monthly trend for Global Engineering?".' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    const rawResponse = await analyzeData(userMessage, contextData);
    
    let parsedResponse: AiResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch (e) {
      // Fallback if parsing fails
      parsedResponse = { text: rawResponse };
    }

    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: parsedResponse.text,
      chart: parsedResponse.chart
    }]);
    setIsLoading(false);
  };

  const renderChart = (chart: AiResponse['chart']) => {
    if (!chart) return null;

    return (
      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm h-48 w-full">
        <p className="text-xs font-semibold text-slate-500 mb-2 text-center uppercase tracking-wide">{chart.title}</p>
        <ResponsiveContainer width="100%" height="85%">
          {chart.type === 'bar' ? (
            <BarChart data={chart.data} margin={{top:0, right:0, left:-20, bottom:0}}>
              <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{fontSize:'12px', borderRadius: '8px', border:'none'}} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chart.type === 'pie' ? (
            <PieChart margin={{top:0, right:0, left:0, bottom:0}}>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={5}
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{fontSize:'12px', borderRadius: '8px', border:'none'}} />
            </PieChart>
          ) : (
            <AreaChart data={chart.data} margin={{top:5, right:0, left:-20, bottom:0}}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{fontSize:'12px', borderRadius: '8px', border:'none'}} />
              <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h2 className="font-semibold">AI Analyst</h2>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              {msg.role === 'ai' && <Sparkles size={14} className="mb-1 text-indigo-500" />}
              <div className="prose prose-sm prose-slate max-w-none">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 last:mb-0">{line}</p>
                ))}
              </div>
              
              {/* Render Chart if available */}
              {msg.role === 'ai' && msg.chart && renderChart(msg.chart)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                   <Loader2 size={16} className="animate-spin" />
                   Thinking...
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
            placeholder="Ask about spend, trends, or providers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
