import React from 'react';
import { LightingMode, Language } from '../types';
import { Camera, Lightbulb, ArrowDown } from 'lucide-react';

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

export default RayDiagram;
