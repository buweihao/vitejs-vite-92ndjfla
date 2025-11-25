import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Info, 
  Languages, 
  Camera, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Bot, 
  Loader2 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. TYPES & CONFIG
// ==========================================

export enum LightingMode {
  BRIGHT_FIELD = 'BRIGHT_FIELD',
  DARK_FIELD = 'DARK_FIELD'
}

export type Language = 'en' | 'zh';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// ==========================================
// 2. GEMINI AI SERVICE
// ==========================================

// NOTE: In a real "Zero Runtime" static deployment, you must configure your build tool 
// (e.g., Vite, Webpack) to replace process.env.API_KEY with the actual key at build time,
// OR use an environment variable in your hosting provider (Vercel/Netlify).
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const askOpticsExpert = async (
  query: string,
  history: ChatMessage[],
  language: Language
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const langInstruction = language === 'zh' 
      ? "Reply in Simplified Chinese. Explain concepts using standard Machine Vision terminology in Chinese." 
      : "Reply in English.";

    const systemInstruction = `
      You are an expert Professor of Machine Vision and Optics. 
      Your goal is to explain lighting techniques to students simply and clearly.
      
      Current Topic: Bright Field vs. Dark Field Lighting.
      
      Rules:
      1. ${langInstruction}
      2. Keep answers concise (under 150 words) unless asked for detail.
      3. Use analogies (e.g., "like a mirror" or "like driving in fog").
      4. Focus on the physics of reflection (Angle of Incidence = Angle of Reflection).
      5. Formatting: Use bullet points for clarity.
    `;

    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: query }]
      }
    ];

    const response = await ai.models.generateContent({
      model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || (language === 'zh' ? "抱歉，我现在无法回答光学问题。" : "I couldn't generate a response regarding optics at the moment.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'zh' 
      ? "连接 AI 导师失败，请检查 API 密钥。" 
      : "Error connecting to the Optics AI Tutor. Please check your API key.";
  }
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

// --- RayDiagram Component ---
interface RayDiagramProps {
  mode: LightingMode;
  language: Language;
}

const RayDiagram: React.FC<RayDiagramProps> = ({ mode, language }) => {
  const isBrightField = mode === LightingMode.BRIGHT_FIELD;
  const isZh = language === 'zh';

  // SVG Configuration
  const width = 400;
  const height = 300;
  const centerX = width / 2;
  const surfaceY = 250;
  const cameraY = 60;
  
  // Surface Geometry (Flat with a V-dent in middle)
  const dentWidth = 40;
  const dentDepth = 15;
  const dentLeft = centerX - dentWidth / 2;
  const dentRight = centerX + dentWidth / 2;
  const dentBottom = surfaceY + dentDepth;

  return (
    <div className="w-full bg-slate-800 rounded-xl border border-slate-700 flex flex-col p-4 shadow-inner">
      
      {/* Header / Legend */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-slate-400 font-mono">
          {isZh ? '物理光路示意图' : 'PHYSICAL RAY DIAGRAM'}
        </div>
        <div className="flex space-x-3 text-[10px] md:text-xs">
           <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-yellow-400"></div>
              <span className="text-yellow-100">{isZh ? '光线路径' : 'Light Ray'}</span>
           </div>
           <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-slate-500 border border-slate-400"></div>
              <span className="text-slate-300">{isZh ? '被测物体' : 'Object'}</span>
           </div>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="relative w-full h-[320px] bg-slate-900/50 rounded-lg border border-slate-800">
        
        {/* HTML Overlay Elements (Icons) */}
        
        {/* 1. Camera (Always at top) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <Camera className="w-8 h-8 text-cyan-400" />
          <div className="text-[10px] text-cyan-200 bg-slate-900/80 px-2 rounded mt-1">
             {isZh ? '相机 (接收端)' : 'Camera (Sensor)'}
          </div>
        </div>

        {/* 2. Light Source (Position changes based on mode) */}
        <div 
          className={`absolute z-20 transition-all duration-700 ease-in-out flex flex-col items-center
            ${isBrightField 
              ? 'top-[80px] left-1/2 -translate-x-1/2' 
              : 'bottom-[80px] left-[10px]'}
          `}
        >
          <Lightbulb className={`w-8 h-8 ${isBrightField ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400 fill-yellow-400'} animate-pulse`} />
          <div className="text-[10px] text-yellow-200 bg-slate-900/80 px-2 rounded mt-1 whitespace-nowrap">
            {isBrightField 
              ? (isZh ? '同轴/高角度光源' : 'High Angle Source') 
              : (isZh ? '低角度光源' : 'Low Angle Source')}
          </div>
        </div>

        {/* SVG Ray Tracing Layer */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#facc15" />
            </marker>
             <marker id="arrow-faint" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#facc15" opacity="0.4" />
            </marker>
          </defs>

          {/* The Surface (Object) */}
          {/* Flat line with a dent in the middle */}
          <path 
            d={`M 20 ${surfaceY} L ${dentLeft} ${surfaceY} L ${centerX} ${dentBottom} L ${dentRight} ${surfaceY} L ${width-20} ${surfaceY}`}
            stroke="#64748b" 
            strokeWidth="4" 
            fill="none" 
          />
          {/* Surface Fill for clarity */}
          <path 
            d={`M 20 ${surfaceY} L ${dentLeft} ${surfaceY} L ${centerX} ${dentBottom} L ${dentRight} ${surfaceY} L ${width-20} ${surfaceY} L ${width-20} ${height} L 20 ${height} Z`}
            fill="#1e293b" 
            opacity="0.5"
          />

          {/* RAYS */}
          {isBrightField ? (
            <g className="animate-dash">
              {/* Ray 1: Hits Flat Surface -> Reflects UP into Camera (BRIGHT) */}
              <path 
                d={`M ${centerX - 60} 100 L ${centerX - 60} ${surfaceY} L ${centerX - 10} ${cameraY + 20}`} 
                stroke="#facc15" 
                strokeWidth="2" 
                fill="none" 
                markerEnd="url(#arrow)"
              />
              <text x={centerX - 80} y={surfaceY - 40} fill="white" fontSize="10" textAnchor="end">
                {isZh ? '照射平坦处' : 'Hits Flat'}
              </text>

               {/* Ray 2: Hits Slope of Dent -> Reflects AWAY (DARK) */}
               {/* Hitting the left slope of the dent */}
              <path 
                d={`M ${centerX - 10} 100 L ${centerX - 10} ${dentBottom - 5} L ${centerX + 80} ${surfaceY - 60}`} 
                stroke="#facc15" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="4,4"
                markerEnd="url(#arrow-faint)"
                opacity="0.6"
              />
               <text x={centerX + 90} y={surfaceY - 60} fill="#94a3b8" fontSize="10">
                {isZh ? '杂散光 (不进镜头)' : 'Scatter (Misses Lens)'}
              </text>
            </g>
          ) : (
            <g className="animate-dash">
              {/* Ray 1: Low Angle -> Hits Flat Surface -> Reflects AWAY (DARK) */}
              <path 
                d={`M 50 ${surfaceY - 40} L ${centerX - 50} ${surfaceY} L ${width - 50} ${surfaceY - 100}`} 
                stroke="#facc15" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="4,4"
                markerEnd="url(#arrow-faint)"
                opacity="0.6"
              />
               <text x={width - 50} y={surfaceY - 105} fill="#94a3b8" fontSize="10">
                {isZh ? '反射光 (不进镜头)' : 'Reflects Away'}
              </text>

              {/* Ray 2: Low Angle -> Hits Slope of Dent -> Reflects UP into Camera (BRIGHT) */}
              <path 
                d={`M 50 ${surfaceY - 30} L ${dentLeft + 5} ${surfaceY + 2} L ${centerX} ${cameraY + 20}`} 
                stroke="#facc15" 
                strokeWidth="2" 
                fill="none" 
                markerEnd="url(#arrow)"
              />
              <text x={centerX + 10} y={cameraY + 50} fill="white" fontSize="10" textAnchor="start">
                 {isZh ? '漫反射进镜头' : 'Diffused into Lens'}
              </text>
            </g>
          )}

          {/* Labels for Object Features */}
          <text x={centerX - 80} y={surfaceY + 20} fill="#64748b" fontSize="10" textAnchor="middle">
             {isZh ? '平坦表面' : 'Flat Surface'}
          </text>
          <text x={centerX} y={surfaceY + 35} fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">
             {isZh ? '缺陷/刻字' : 'Defect/Text'}
          </text>

        </svg>
      </div>
      
      {/* Logic Summary Footer */}
      <div className="mt-3 p-2 bg-slate-900 rounded text-center">
        <p className="text-xs text-slate-300">
          {mode === LightingMode.BRIGHT_FIELD 
            ? (isZh ? '结论：平坦反光强 (白)，缺陷反光跑偏 (黑)' : 'Result: Flat reflects light IN. Defect reflects light OUT.')
            : (isZh ? '结论：平坦反光跑偏 (黑)，缺陷把光“勾”进镜头 (白)' : 'Result: Flat reflects light OUT. Defect catches light IN.')
          }
        </p>
      </div>
    </div>
  );
};

// --- SimulatedImage Component ---
interface SimulatedImageProps {
  mode: LightingMode;
  language: Language;
}

const SimulatedImage: React.FC<SimulatedImageProps> = ({ mode, language }) => {
  const isBrightField = mode === LightingMode.BRIGHT_FIELD;
  const isZh = language === 'zh';

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs text-slate-400 uppercase tracking-widest">
        {isZh ? '相机成像效果' : 'Camera Output'}
      </div>
      
      <div className="relative w-48 h-48 rounded-full border-4 border-slate-600 overflow-hidden shadow-2xl flex items-center justify-center transition-colors duration-700">
        
        {/* Background Layer */}
        <div className={`absolute inset-0 transition-colors duration-700 ${isBrightField ? 'bg-white' : 'bg-black'}`}></div>

        {/* The Feature (Scratch/Text) */}
        {/* In Bright Field: Background is White, Defect scatters light away -> Defect looks DARK */}
        {/* In Dark Field: Background is Black, Defect scatters light up -> Defect looks BRIGHT */}
        
        <div className="relative z-10 flex flex-col items-center justify-center transform rotate-12">
           {/* Simulating a "5" or scratch */}
           <div className={`
             text-6xl font-bold font-serif transition-colors duration-700 select-none
             ${isBrightField ? 'text-slate-800' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'}
           `}>
             5¢
           </div>
           <div className={`
              mt-2 w-16 h-1 rounded-full transition-colors duration-700
              ${isBrightField ? 'bg-slate-900' : 'bg-white shadow-[0_0_8px_white]'}
           `}></div>
        </div>

        {/* Glare effect for realism */}
        <div className="absolute top-4 right-8 w-8 h-8 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      <div className="text-center px-4">
        <p className="font-semibold text-sm text-optics-accent">
          {isBrightField 
            ? (isZh ? '背景亮 (白色)，特征暗 (黑色)' : 'Bright Background, Dark Features')
            : (isZh ? '背景暗 (黑色)，特征亮 (白色)' : 'Dark Background, Bright Features')}
        </p>
      </div>

      <div className="w-full space-y-3 mt-6 pt-4 border-t border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-400 uppercase">
          {isZh ? '适用场景' : 'Best For Detecting'}
        </h4>
        <ul className="space-y-2">
          {mode === LightingMode.BRIGHT_FIELD ? (
            <>
              <li className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 
                {isZh ? '表面平整度检测' : 'Flatness inspection'}
              </li>
              <li className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 
                {isZh ? '明显的黑点 / 深坑' : 'Dark spots / Deep pits'}
              </li>
              <li className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 
                {isZh ? '有无检测 (Presence)' : 'Presence/Absence'}
              </li>
              <li className="flex items-center text-sm text-slate-500">
                <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" /> 
                {isZh ? '细微划痕 (不适用)' : 'Tiny surface scratches'}
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 
                {isZh ? '表面细微划痕 (最常用)' : 'Surface Scratches'}
              </li>
              <li className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 
                {isZh ? 'OCR 字符识别 / 浮雕字' : 'Embossed/Engraved Text'}
              </li>
              <li className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 
                {isZh ? '边缘轮廓检测' : 'Edge defects'}
              </li>
              <li className="flex items-center text-sm text-slate-500">
                <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" /> 
                {isZh ? '平坦区域的颜色变化' : 'Color changes on flat surfaces'}
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

// --- AIChat Component ---
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

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================

const App: React.FC = () => {
  const [mode, setMode] = useState<LightingMode>(LightingMode.BRIGHT_FIELD);
  const [language, setLanguage] = useState<Language>('zh');

  const toggleMode = (newMode: LightingMode) => {
    setMode(newMode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const isZh = language === 'zh';

  // Content dictionary for simple translation handling
  const t = {
    title: isZh ? "机器视觉光学" : "VisionOptics",
    subtitle: isZh ? "照明的核心逻辑" : "Illumination Logic",
    desc: isZh 
      ? "掌握机器视觉打光最底层的物理逻辑：亮视野 vs 暗视野。"
      : "Master the core physics of machine vision: The battle between Bright Field and Dark Field.",
    
    // Bright Field Content
    bfTitle: isZh ? "亮视野 (Bright Field)" : "Bright Field Logic",
    bfDesc: isZh 
      ? "原理：光源位于相机与物体之间。光线垂直照射到平坦表面后，直接反射进入镜头（镜面反射），因此背景是白色的。而凹凸不平的特征（如刻字、划痕）会将光线散射到侧面，无法进入镜头，呈现为黑色。"
      : "Light source is high/coaxial. Light hits the flat surface and reflects directly into the lens (specular reflection), making the background bright. Defects scatter light sideways, appearing dark.",
    
    // Dark Field Content
    dfTitle: isZh ? "暗视野 (Dark Field) / 低角度照明" : "Dark Field Logic",
    dfDesc: isZh
      ? "原理：光源以极低的角度（通常 0°~30°）照射物体。大部分光线照射到平坦表面后，像打水漂一样反射离开，不进镜头。只有遇到突起、边缘、划痕时，光线才会发生改变方向，反射进入镜头。背景呈黑色，特征呈亮白色。"
      : "Light source is at a low angle (0-30°). Light hitting the flat surface reflects away from the lens. Only when light hits an edge or scratch does it deflect UP into the lens, making the defect shine brightly.",

    // Button Labels
    btnBf: isZh ? "亮视野" : "Bright Field",
    btnDf: isZh ? "暗视野" : "Dark Field",

    // Real World Section
    rwTitle: isZh ? "实际应用案例" : "Real-world Application",
    rwIntro: isZh
      ? "图例分析（截图中的硬币和芯片）："
      : "The Coin & Chip Example: When inspecting a coin or a microchip, the background is often reflective.",
    
    rwBfHeader: isZh ? "亮视野下：" : "In Bright Field:",
    rwBfText: isZh
      ? "平坦的金属表面像镜子一样，将光线直接反射进相机，导致背景过曝（全白）。特征难以辨认。"
      : "The flat metal acts like a mirror, blinding the camera with white glare. The text is hard to read because it blends in or just looks messy.",
    
    rwDfHeader: isZh ? "暗视野下：" : "In Dark Field:",
    rwDfText: isZh
      ? "背景漆黑，但“5分”、“LM386”字样轮廓非常清晰高亮。这是因为平坦表面将光反射走，而字体的边缘将低角度的光“折射”进了相机。"
      : "The flat mirror-like surface reflects light *away* from the camera (Black background). However, the raised edges of the '5 cents' or 'LM386' text catch the low-angle light and redirect it into the lens. The result? Crystal clear, glowing text."
  };

  return (
    <div className="min-h-screen bg-optics-dark text-slate-200 pb-20">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              {t.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
             <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 hover:text-white transition-all text-sm text-slate-400"
             >
                <Languages className="w-4 h-4" />
                <span>{language === 'en' ? 'English' : '中文'}</span>
             </button>
             <div className="text-xs font-mono text-slate-500 hidden md:block">
               INTERACTIVE LEARNING
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Hero / Intro */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t.subtitle}
          </h2>
          <p className="text-slate-400 text-lg">
            {t.desc}
          </p>
        </section>

        {/* Interactive Simulation Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Controls & Diagram (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap justify-center gap-4 bg-slate-800/50 p-2 rounded-xl mx-auto w-full md:w-auto">
              <button
                onClick={() => toggleMode(LightingMode.BRIGHT_FIELD)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  mode === LightingMode.BRIGHT_FIELD
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50 ring-2 ring-cyan-400/50'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-semibold">{t.btnBf}</span>
              </button>
              <button
                onClick={() => toggleMode(LightingMode.DARK_FIELD)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  mode === LightingMode.DARK_FIELD
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 ring-2 ring-blue-400/50'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-semibold">{t.btnDf}</span>
              </button>
            </div>

            <RayDiagram mode={mode} language={language} />
            
            {/* Contextual Info Card */}
            <div className={`
              border rounded-xl p-6 transition-all duration-500
              ${mode === LightingMode.BRIGHT_FIELD 
                ? 'bg-cyan-900/20 border-cyan-800/50' 
                : 'bg-blue-900/20 border-blue-800/50'}
            `}>
              <h3 className={`text-xl font-bold mb-2 flex items-center ${
                 mode === LightingMode.BRIGHT_FIELD ? 'text-cyan-400' : 'text-blue-400'
              }`}>
                <Info className="w-5 h-5 mr-2" />
                {mode === LightingMode.BRIGHT_FIELD ? t.bfTitle : t.dfTitle}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {mode === LightingMode.BRIGHT_FIELD ? t.bfDesc : t.dfDesc}
              </p>
            </div>
          </div>

          {/* Camera Output Simulation (Span 1) */}
          <div className="lg:col-span-1 flex flex-col items-center justify-start space-y-6 bg-slate-800/30 p-6 rounded-xl border border-slate-800 h-full">
            <SimulatedImage mode={mode} language={language} />
          </div>

        </section>

        <hr className="border-slate-800" />

        {/* Real World Examples Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <span className="w-1 h-8 bg-optics-accent mr-3 rounded-full"></span>
                  {t.rwTitle}
                </h3>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <p className="font-medium text-slate-200 mb-4">
                        {t.rwIntro}
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-cyan-500">
                             <span className="text-cyan-400 font-bold block mb-1">{t.rwBfHeader}</span> 
                             <p className="text-slate-400 text-sm">{t.rwBfText}</p>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-blue-500">
                             <span className="text-blue-400 font-bold block mb-1">{t.rwDfHeader}</span> 
                             <p className="text-slate-400 text-sm">{t.rwDfText}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Tutor Integration */}
            <div className="h-full min-h-[400px] flex flex-col">
               <h3 className="text-lg font-bold text-slate-400 mb-4 hidden md:block">
                  {isZh ? '遇到问题？问问 AI 助教' : 'Have questions? Ask AI'}
               </h3>
               <div className="flex-1">
                 <AIChat language={language} /> 
               </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default App;