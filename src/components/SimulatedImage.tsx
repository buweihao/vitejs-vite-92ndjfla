import React from 'react';
import { LightingMode, Language } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

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

export default SimulatedImage;