import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { POWDER_PRODUCTS, CONFIG } from './constants';
import { generateWeeklyPlan, calculateMealNutrition, calculateWeeklyStats } from './utils/calculation';
import { WeeklyPlan, DailyPlan, MealItem, PlanType } from './types';

// --- Icons (Refined Size) ---
const Icons = {
  Wallet: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Fire: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>,
  Water: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a.75.75 0 01.75.75v5.59l2.64-1.32a.75.75 0 11.67 1.342l-4.5 2.25a.75.75 0 01-.67 0l-4.5-2.25a.75.75 0 01.67-1.342l2.64 1.32V2.75A.75.75 0 0110 2z" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Clock: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Coffee: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /></svg>,
  Heart: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
};

// --- Helper: Count Up Animation ---
const CountUp = ({ end, duration = 1000, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(ease * end));
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <>{count}{suffix}</>;
};

// --- Interactive Charts ---

// 1. Interactive Cost Trend Chart
const CostTrendChart = ({ data, onSelectDay }: { data: number[], onSelectDay: (i: number) => void }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (!data.length) return null;
  const height = 100; // Refined height
  const width = 600; 
  const max = Math.max(...data) * 1.2;
  const min = Math.min(...data) * 0.8;
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return { x, y, val, idx: i };
  });

  const linePath = points.reduce((acc, p, i) => i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-32 relative group">
      <svg viewBox={`-10 -10 ${width + 20} ${height + 20}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradientCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
          <clipPath id="chart-clip">
            <rect x="0" y="-10" width={animate ? width + 20 : 0} height={height + 20} className="transition-all duration-[1500ms] ease-out" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#chart-clip)">
          <path d={areaPath} fill="url(#gradientCost)" />
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {points.map((p, i) => (
          <g key={i} onClick={() => onSelectDay(p.idx)} className="cursor-pointer">
            <rect 
              x={p.x - width / (data.length * 2)} 
              y="0" 
              width={width / data.length} 
              height={height} 
              fill="transparent" 
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hoverIndex === i ? 6 : 4} 
              fill="white" 
              stroke="#6366f1" 
              strokeWidth={hoverIndex === i ? 3 : 2}
              className="transition-all duration-200 ease-out"
              style={{ opacity: animate ? 1 : 0, transitionDelay: `${i * 100}ms` }}
            />
          </g>
        ))}
      </svg>
      
      {hoverIndex !== null && (
        <div 
          className="absolute top-0 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg flex flex-col items-center animate-fade-in z-20"
          style={{ left: `${(hoverIndex / (data.length - 1)) * 100}%` }}
        >
          <span>第 {hoverIndex + 1} 天</span>
          <span className="text-indigo-200">¥{data[hoverIndex].toFixed(1)}</span>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// 2. Animated Bar Chart
const KcalBarChart = ({ days }: { days: DailyPlan[] }) => {
  const max = Math.max(...days.map(d => d.nutrition.totalEnergy)) * 1.1;
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
     setTimeout(() => setAnimate(true), 100);
  }, []);
  
  return (
    <div className="flex justify-between items-end h-32 gap-3 pt-4">
      {days.map((d, i) => {
        const percent = (d.nutrition.totalEnergy / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <div className="w-full bg-slate-50 rounded-lg relative h-full flex items-end overflow-hidden group-hover:bg-slate-100 transition-colors duration-300">
               <div 
                 style={{ height: animate ? `${percent}%` : '0%' }} 
                 className="w-full bg-gradient-to-t from-orange-400 to-amber-300 rounded-lg relative transition-all duration-[1000ms] ease-out shadow-sm group-hover:shadow-md group-hover:to-orange-300"
               >
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
               </div>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400">{d.dayName}</span>
              <span className="block text-[9px] font-medium text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-4 group-hover:mt-0 absolute transform -translate-y-full bg-white px-1.5 py-0.5 shadow-sm rounded border border-orange-100 z-10">{d.nutrition.totalEnergy.toFixed(0)}</span>
            </div>
          </div>
        )
      })}
    </div>
  );
};

// 3. Macro Ring Chart
const MacroRingChart = ({ p, f, c, kcal }: { p: number, f: number, c: number, kcal: number }) => {
  const r = 42; 
  const cCrcl = 2 * Math.PI * r;
  const total = p + f + c;
  const pPct = (p / total);
  const fPct = (f / total);
  const cPct = (c / total);
  
  const pOff = cCrcl * (1 - pPct);
  const fOff = cCrcl * (1 - fPct);
  const cOff = cCrcl * (1 - cPct);

  const [offsetP, setOffsetP] = useState(cCrcl);
  const [offsetF, setOffsetF] = useState(cCrcl);
  const [offsetC, setOffsetC] = useState(cCrcl);
  const [hovered, setHovered] = useState<'P' | 'F' | 'C' | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffsetP(pOff);
      setOffsetF(fOff);
      setOffsetC(cOff);
    }, 200);
    return () => clearTimeout(t);
  }, [pOff, fOff, cOff, cCrcl]);

  const pRot = -90;
  const fRot = pRot + (pPct * 360);
  const cRot = fRot + (fPct * 360);

  const getLabel = () => {
      if (hovered === 'P') return { val: p.toFixed(0), unit: 'g', text: '蛋白质', color: 'text-emerald-500' };
      if (hovered === 'F') return { val: f.toFixed(0), unit: 'g', text: '脂肪', color: 'text-amber-500' };
      if (hovered === 'C') return { val: c.toFixed(0), unit: 'g', text: '碳水', color: 'text-rose-500' };
      return { val: <CountUp end={kcal} />, unit: 'Kcal', text: '总热量', color: 'text-slate-800' };
  };

  const info = getLabel();

  return (
    <div className="relative w-48 h-48 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
      <svg width="100%" height="100%" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        
        <circle cx="60" cy="60" r={r} fill="none" stroke="#34d399" strokeWidth={hovered === 'P' ? "12" : "10"}
          strokeDasharray={cCrcl} strokeDashoffset={offsetP}
          transform={`rotate(${pRot} 60 60)`} strokeLinecap="round" className="transition-all duration-[1200ms] ease-out shadow-sm cursor-pointer"
          onMouseEnter={() => setHovered('P')} onMouseLeave={() => setHovered(null)}
        />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#fbbf24" strokeWidth={hovered === 'F' ? "12" : "10"}
          strokeDasharray={cCrcl} strokeDashoffset={offsetF}
          transform={`rotate(${fRot} 60 60)`} strokeLinecap="round" className="transition-all duration-[1200ms] ease-out delay-200 shadow-sm cursor-pointer"
          onMouseEnter={() => setHovered('F')} onMouseLeave={() => setHovered(null)}
        />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f43f5e" strokeWidth={hovered === 'C' ? "12" : "10"}
          strokeDasharray={cCrcl} strokeDashoffset={offsetC}
          transform={`rotate(${cRot} 60 60)`} strokeLinecap="round" className="transition-all duration-[1200ms] ease-out delay-400 shadow-sm cursor-pointer"
          onMouseEnter={() => setHovered('C')} onMouseLeave={() => setHovered(null)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in pointer-events-none">
        <span className={`text-3xl font-black ${info.color}`}>{info.val}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{info.text}</span>
      </div>
    </div>
  );
};

// --- Level 3: Meal Detail Modal ---
const MealDetailModal = ({ meal, onClose }: { meal: MealItem | null, onClose: () => void }) => {
  if (!meal) return null;
  const nutrition = calculateMealNutrition(meal);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl transition-opacity animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] w-full max-w-sm overflow-hidden animate-fade-in transform transition-all scale-100 border border-white">
        
        {/* Header Image Area - Focus on Nutrition */}
        {/* INCREASED HEIGHT: h-64 -> h-80 (320px) to prevent overlap */}
        <div className="relative h-80 bg-gradient-to-bl from-emerald-100 via-teal-50 to-white flex flex-col overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-800 transition-colors shadow-sm z-20">
              <Icons.Close />
           </button>
           
           {/* Center Content: Added pb-8 to push away from bottom bar */}
           <div className="z-10 flex-1 flex flex-col items-center justify-center pt-8 pb-8">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-bold mb-3 tracking-wide text-emerald-600 shadow-sm border border-white">
                 <Icons.Clock /> {meal.label}
             </div>
             <div className="flex flex-col items-center">
                <h3 className="text-5xl font-black tracking-tighter text-slate-800 drop-shadow-sm"><CountUp end={nutrition.energy_kcal} /></h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Kcal 总热量</span>
             </div>
           </div>

           {/* Bottom Bar - Macros: Stays at bottom */}
           <div className="relative z-10 w-full grid grid-cols-3 gap-px bg-slate-100/50 backdrop-blur-sm border-t border-white/50 mt-auto">
              <div className="py-3 flex flex-col items-center justify-center gap-1 text-center">
                  <span className="block text-emerald-600 font-black text-lg leading-none">{nutrition.protein.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">蛋白质</span>
              </div>
              <div className="py-3 flex flex-col items-center justify-center gap-1 text-center">
                  <span className="block text-amber-500 font-black text-lg leading-none">{nutrition.fat.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">脂肪</span>
              </div>
              <div className="py-3 flex flex-col items-center justify-center gap-1 text-center">
                  <span className="block text-rose-500 font-black text-lg leading-none">{nutrition.carbs.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">碳水</span>
              </div>
           </div>
           
           {/* Decorative circles */}
           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 pointer-events-none"></div>
           <div className="absolute top-10 right-10 w-24 h-24 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 pointer-events-none"></div>
        </div>

        <div className="p-6 bg-white relative">
          {/* Ingredients Card */}
          <div className="mb-6">
             <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">配料与成本</h4>
             <div className="space-y-3">
               {meal.liquid ? (
                 <div className="flex justify-between items-center group p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">液</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{meal.liquid.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">流食包 ({meal.liquidGrams}g)</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-400 text-sm">¥{((meal.liquid.priceRaw / 500) * meal.liquidGrams).toFixed(1)}</span>
                 </div>
               ) : null}
               <div className="flex justify-between items-center group p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs shadow-sm">粉</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{meal.powder.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">营养粉剂 ({meal.powderGrams}g)</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-400 text-sm">¥{((meal.powder.priceRaw / 50) * meal.powderGrams).toFixed(1)}</span>
               </div>
               
               <div className="flex justify-between items-center group p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs shadow-sm">
                        <Icons.Water />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">温开水</p>
                      <p className="text-xs text-slate-400 mt-0.5">建议配比 ({meal.water}ml)</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-300 text-xs">免费</span>
               </div>
             </div>
          </div>

          {/* Footer Total Cost */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
             <span className="text-slate-500 font-bold text-xs">本餐总成本</span>
             <span className="text-2xl font-black text-indigo-600">¥{meal.cost.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Level 3: Meal Timeline Item Redesigned ---
interface MealTimelineItemProps {
  meal: MealItem;
  onClick: () => void;
  index: number;
  showTime: boolean;
  planType: PlanType;
}

const MealTimelineItem: React.FC<MealTimelineItemProps> = ({ meal, onClick, index, showTime, planType }) => {
  const isMain = meal.type === 'MAIN';
  const nutrition = calculateMealNutrition(meal);
  
  // Custom time mapping based on index and plan type
  let time = '';
  if (planType === 'TUBE') {
     const timeLabels = ['08:00', '10:30', '12:30', '15:30', '18:30', '21:00'];
     time = timeLabels[index];
  } else {
     const timeLabels = ['08:00', '12:30', '18:30'];
     time = timeLabels[index] || '';
  }

  return (
    <div className="relative pl-6 pb-6 last:pb-0 group">
      {/* Connector Line */}
      <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-slate-100 group-last:hidden"></div>
      
      {/* Time Indicator (Dot) */}
      <div className={`absolute left-0 top-6 w-5 h-5 rounded-full border-[3px] z-10 bg-white flex items-center justify-center transition-all duration-300 ${isMain ? 'border-indigo-400 scale-110 shadow-sm' : 'border-slate-300'}`}>
         {isMain && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
      </div>

      <div 
        onClick={onClick}
        className={`ml-5 relative flex flex-col p-4 rounded-[1.5rem] border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] bg-white ${
          isMain 
          ? 'border-indigo-50 shadow-sm' 
          : 'border-slate-100 hover:border-slate-200'
        }`}
      >
        {/* Top Row: Time & Label */}
        <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                 {time && <span className="text-xs font-bold text-slate-400 font-mono tracking-tight">{time}</span>}
                 <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${isMain ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {meal.label}
                 </span>
             </div>
             <div className="flex items-center gap-1">
                 <span className="text-xs font-black text-slate-800">¥{meal.cost.toFixed(1)}</span>
                 <Icons.ChevronRight />
             </div>
        </div>

        {/* Meal Content */}
        <div className="mb-4">
             {meal.liquid ? (
                <div className="flex items-center gap-2">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-400 to-purple-400"></div>
                    <div>
                        <h4 className="font-black text-slate-800 text-base leading-tight mb-1">{meal.liquid.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium block">营养液({meal.liquidGrams}g) + {meal.powder.name}({meal.powderGrams}g)</span>
                    </div>
                </div>
             ) : (
                <div className="flex items-center gap-2">
                    <div className="w-1 h-8 rounded-full bg-slate-300"></div>
                    <div>
                        <h4 className="font-bold text-slate-600 text-sm leading-tight mb-1">{meal.powder.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium block">标准营养粉剂冲调 ({meal.powderGrams}g)</span>
                    </div>
                </div>
             )}
        </div>

        {/* Nutrition Pills & Water Ratio */}
        <div className="flex flex-wrap items-center gap-2">
             <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg border border-orange-100">
                <Icons.Fire />
                <span className="text-[10px] font-bold text-orange-500">{nutrition.energy_kcal.toFixed(0)}</span>
             </div>
             <div className="flex items-center gap-1 px-2 py-1 bg-blue-50/50 rounded-lg border border-blue-100">
                <Icons.Water />
                <span className="text-[10px] font-bold text-blue-500">{meal.water}ml</span>
             </div>
             <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-[9px] font-bold text-emerald-400 uppercase">蛋</span>
                <span className="text-[10px] font-bold text-emerald-600">{nutrition.protein.toFixed(0)}</span>
             </div>
             <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-[9px] font-bold text-amber-400 uppercase">脂</span>
                <span className="text-[10px] font-bold text-amber-600">{nutrition.fat.toFixed(0)}</span>
             </div>
             <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-lg border border-rose-100">
                <span className="text-[9px] font-bold text-rose-400 uppercase">碳</span>
                <span className="text-[10px] font-bold text-rose-600">{nutrition.carbs.toFixed(0)}</span>
             </div>
        </div>
      </div>
    </div>
  );
};

// --- Level 2: Weekly Dashboard View ---
const WeeklyDashboard = ({ plan, onSelectDay }: { plan: WeeklyPlan, onSelectDay: (idx: number) => void }) => {
  const stats = useMemo(() => calculateWeeklyStats(plan.days), [plan]);
  const costTrend = plan.days.map(d => d.cost);

  const handleExportExcel = () => {
    const rows = plan.days.flatMap(day => 
        day.meals.map(meal => {
            const nut = calculateMealNutrition(meal);
            return {
                '日期': day.dayName,
                '时段': meal.label,
                '餐类': meal.liquid ? meal.liquid.name : '纯粉剂',
                '流食量(g)': meal.liquidGrams || 0,
                '粉剂名称': meal.powder.name,
                '粉剂量(g)': meal.powderGrams,
                '加水量(ml)': meal.water,
                '热量(kcal)': Math.round(nut.energy_kcal),
                '蛋白质(g)': Number(nut.protein.toFixed(1)),
                '脂肪(g)': Number(nut.fat.toFixed(1)),
                '碳水(g)': Number(nut.carbs.toFixed(1)),
                '单餐成本': Number(meal.cost.toFixed(2))
            };
        })
    );
    
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "周餐谱详情");
    
    XLSX.writeFile(workbook, `祺生园-周餐谱-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto px-4">
      {/* 1. Dashboard Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Stats Card - Clean Light */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
               <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">周度看板</h2>
               <div className="flex items-center gap-2 mt-1">
                 <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">{plan.planType === 'TUBE' ? '管饲餐 (6餐/日)' : '吞咽困难餐 (3餐/日)'}</span>
                 <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">预算概览</p>
               </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
               <div className="px-4 py-2 bg-indigo-50/80 backdrop-blur-sm text-indigo-600 rounded-2xl text-xs font-bold border border-indigo-100 shadow-sm flex flex-col items-end">
                  <span className="text-[10px] opacity-70 uppercase tracking-wider mb-0.5">月预算预估</span>
                  <span className="text-base">¥{plan.monthlyCost.toFixed(0)}</span>
               </div>
               <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer z-20"
               >
                  <Icons.Download />
                  导出表格
               </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
             <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">本周总花费</span>
                <p className="text-4xl font-black text-slate-800 tracking-tight">¥<CountUp end={stats.totalCost} /></p>
             </div>
             <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">日均热量</span>
                <p className="text-4xl font-black text-orange-400 tracking-tight"><CountUp end={stats.avgEnergy} /></p>
             </div>
             <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">日均蛋白</span>
                <p className="text-4xl font-black text-emerald-500 tracking-tight"><CountUp end={stats.avgProtein} /><span className="text-base text-slate-300 font-bold ml-1">g</span></p>
             </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">花费趋势 (点击交互)</span>
            </div>
            <CostTrendChart data={costTrend} onSelectDay={onSelectDay} />
          </div>
        </div>

        {/* Side Stats Card: Calorie Trend - Clean Light */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-50/50 to-transparent"></div>
           <div className="mb-6 relative z-10">
              <h3 className="text-xl font-black text-slate-800">热量分布</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">每日热量摄入</p>
           </div>
           <div className="flex-1 flex items-end relative z-10">
              <KcalBarChart days={plan.days} />
           </div>
        </div>
      </div>

      {/* 2. Days Grid - Show all meals with 4x2 Symmetry */}
      <div>
         <div className="flex items-center gap-2 mb-6 px-4 opacity-60">
            <Icons.Calendar />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">一周餐谱概览 (点击查看详情)</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 7 Days Cards */}
            {plan.days.map((day, idx) => (
               <button 
                  key={idx} 
                  onClick={() => onSelectDay(idx)}
                  className="group relative bg-white p-6 rounded-[2rem] border border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden flex flex-col h-full"
               >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                     <span className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{day.dayName}</span>
                     <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-lg">第 {idx + 1} 天</span>
                  </div>
                  
                  {/* Meals Grid View - Adaptive grid based on meal count */}
                  <div className={`grid ${plan.planType === 'TUBE' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-6 relative z-10 flex-1 content-start`}>
                    {day.meals.map((m, i) => (
                      <div key={i} className={`flex flex-col p-2 rounded-xl border ${m.type === 'MAIN' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                         <div className="flex items-center justify-between mb-1">
                            <span className={`text-[9px] font-bold px-1.5 rounded-md ${m.type === 'MAIN' ? 'text-indigo-600 bg-white' : 'text-slate-400 bg-white'}`}>
                               {m.label}
                            </span>
                         </div>
                         <span className={`text-[10px] font-bold truncate ${m.type === 'MAIN' ? 'text-slate-700' : 'text-slate-400'}`}>
                            {m.liquid ? m.liquid.name : '营养粉'}
                         </span>
                         <span className="text-[8px] text-slate-400 font-mono mt-0.5">
                            {m.liquid ? `${m.liquidGrams}g` : `${m.powderGrams}g`}
                         </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer Stats */}
                  <div className="relative z-10 w-full pt-4 border-t border-slate-50 flex justify-between items-center group-hover:border-indigo-50 transition-colors mt-auto">
                     <div className="flex items-baseline gap-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">成本</span>
                       <span className="font-black text-slate-800 text-sm">¥{day.cost.toFixed(0)}</span>
                     </div>
                     <div className="flex items-baseline gap-1">
                       <span className="font-black text-orange-400 text-sm">{day.nutrition.totalEnergy.toFixed(0)}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Kcal</span>
                     </div>
                  </div>
               </button>
            ))}

            {/* 8th Card: Health Tip for Symmetry (4x2) */}
            <div className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.3)] text-white overflow-hidden flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                
                <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Icons.Heart />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80">健康贴士</span>
                        <h3 className="font-bold text-lg leading-tight">每日关注</h3>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium leading-relaxed opacity-90 mb-4">
                        老年人饮食应遵循<span className="font-black text-white bg-white/20 px-1 rounded mx-1">少食多餐</span>原则。
                    </p>
                    <p className="text-xs leading-relaxed opacity-80">
                        {plan.planType === 'TUBE' 
                            ? "管饲餐模式采用每日6餐制，主食定量，加餐补充能量，有助于平稳血糖，减轻肠胃负担。" 
                            : "吞咽困难餐模式采用每日3餐制，严格控制流食与粉剂的配比，确保营养密度与吞咽安全。"}
                    </p>
                </div>

                <div className="relative z-10 pt-6 mt-auto border-t border-white/20">
                     <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">关爱长者健康</span>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Level 2: Daily Detail View ---
const DailyDetailView = ({ day, onBack, onMealClick, planType }: { day: DailyPlan, onBack: () => void, onMealClick: (meal: MealItem) => void, planType: PlanType }) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-800">
           <Icons.ArrowLeft />
        </button>
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">{day.dayName}</h2>
           <p className="text-slate-400 text-sm font-bold tracking-wide uppercase mt-0.5">单日餐谱详情</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
         {/* Left: Nutrition Stats & Cost (Swapped from Right) */}
         <div className="md:col-span-5 lg:col-span-4 space-y-6">
            {/* Macro Ring Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                
                <h3 className="text-lg font-black text-slate-800 mb-6 relative z-10">今日营养摄入</h3>
                <div className="mb-6 relative z-10">
                   <MacroRingChart 
                      p={day.nutrition.totalProtein} 
                      f={day.nutrition.totalFat} 
                      c={day.nutrition.totalCarbs}
                      kcal={day.nutrition.totalEnergy} 
                   />
                </div>
                
                {/* Legend */}
                <div className="w-full space-y-3 relative z-10">
                   <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-emerald-50/50">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <span className="text-xs font-bold text-slate-500">蛋白质</span>
                      </div>
                      <span className="font-black text-emerald-600">{day.nutrition.totalProtein.toFixed(0)}g</span>
                   </div>
                   <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-amber-50/50">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                         <span className="text-xs font-bold text-slate-500">脂肪</span>
                      </div>
                      <span className="font-black text-amber-600">{day.nutrition.totalFat.toFixed(0)}g</span>
                   </div>
                   <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-rose-50/50">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                         <span className="text-xs font-bold text-slate-500">碳水</span>
                      </div>
                      <span className="font-black text-rose-600">{day.nutrition.totalCarbs.toFixed(0)}g</span>
                   </div>
                </div>
            </div>

            {/* Cost Summary Card - Light Theme Design */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2rem] p-6 text-slate-800 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-orange-100 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
               
               <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-500">
                      <Icons.Wallet />
                   </div>
                   <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60 text-slate-500">今日成本</span>
                      <h3 className="font-black text-lg text-slate-800">成本汇总</h3>
                   </div>
               </div>

               <div className="flex items-end justify-between relative z-10">
                   <span className="text-3xl font-black text-slate-800">¥{day.cost.toFixed(1)}</span>
                   <span className="text-xs font-bold opacity-60 mb-1.5 text-slate-500">/ 天</span>
               </div>
            </div>
         </div>

         {/* Right: Timeline (Swapped from Left) */}
         <div className="md:col-span-7 lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white">
               <div className="flex items-center gap-2 mb-8 opacity-60">
                  <Icons.Clock />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">用餐时间轴</h3>
               </div>
               
               <div className="border-l-2 border-slate-50 pl-2 ml-2">
                 {day.meals.map((meal, idx) => (
                    <MealTimelineItem 
                       key={idx} 
                       index={idx} 
                       meal={meal} 
                       onClick={() => onMealClick(meal)} 
                       showTime={true}
                       planType={planType}
                    />
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Level 1: Welcome Screen ---
const WelcomeScreen = ({ budget, setBudget, powderId, setPowderId, onGenerate, planType, setPlanType }: any) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 bg-[#f8fafc]">
      {/* Background Blobs - Light and Subtle */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="bg-white/80 p-8 md:p-14 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white w-full max-w-xl text-center relative backdrop-blur-xl">
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-200 mb-10 transform rotate-3 hover:rotate-12 transition-transform duration-500 cursor-pointer">
             <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          
          <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">祺生园</h1>
          <p className="text-slate-400 mb-10 text-lg font-bold tracking-wide uppercase">智能膳食餐谱系统</p>

          <div className="space-y-6 text-left">
            
            {/* Plan Type Selector */}
            <div>
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block ml-1">选择餐型</label>
              <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-[1.2rem] gap-1">
                 <button 
                   onClick={() => setPlanType('TUBE')}
                   className={`py-3 rounded-[1rem] text-sm font-bold transition-all duration-300 ${planType === 'TUBE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   管饲餐 (6餐)
                 </button>
                 <button 
                   onClick={() => setPlanType('DYSPHAGIA')}
                   className={`py-3 rounded-[1rem] text-sm font-bold transition-all duration-300 ${planType === 'DYSPHAGIA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   吞咽困难餐 (3餐)
                 </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block ml-1">月度预算 (元)</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-2xl group-focus-within:text-indigo-500 transition-colors">¥</span>
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(Number(e.target.value))} 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] py-5 pl-12 pr-6 text-2xl font-black text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-200" 
                  placeholder="700" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block ml-1">粉剂类型</label>
              <div className="grid grid-cols-2 gap-4">
                 {POWDER_PRODUCTS.map(p => (
                   <button key={p.id} onClick={() => setPowderId(p.id)} className={`py-4 px-3 rounded-[1.5rem] text-sm font-bold border-2 transition-all duration-300 ${powderId === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100/50 transform -translate-y-1' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200'}`}>{p.id === 101 ? '常规型' : '纤维型'}</button>
                 ))}
              </div>
              {powderId === 102 && (
                  <p className="mt-2 text-[10px] text-indigo-400 font-medium ml-1">
                     💡 纤维型优势：含膳食纤维，有助于肠道管理。
                  </p>
              )}
            </div>

            <button onClick={onGenerate} className="w-full bg-indigo-600 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg mt-2 group">
              生成专属方案 
              <span className="group-hover:translate-x-1 transition-transform"><Icons.ChevronRight /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
type ViewState = 'WELCOME' | 'WEEKLY' | 'DAILY';

export default function App() {
  const [view, setView] = useState<ViewState>('WELCOME');
  const [budget, setBudget] = useState<number>(750);
  const [powderId, setPowderId] = useState<number>(101);
  const [planType, setPlanType] = useState<PlanType>('TUBE');
  
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);

  const handleGenerate = () => {
    const powder = POWDER_PRODUCTS.find(p => p.id === powderId);
    if (powder) {
       const newPlan = generateWeeklyPlan(budget, powder, planType);
       setPlan(newPlan);
       if (newPlan.isValidBudget) {
         setView('WEEKLY');
       }
    }
  };

  const handleDaySelect = (index: number) => {
    setSelectedDayIndex(index);
    setView('DAILY');
  };

  const handleReset = () => {
    setView('WELCOME');
    setPlan(null);
  };

  if (view === 'WELCOME') {
    return <WelcomeScreen budget={budget} setBudget={setBudget} powderId={powderId} setPowderId={setPowderId} onGenerate={handleGenerate} planType={planType} setPlanType={setPlanType} />;
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-900 bg-[#f8fafc]">
      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('WEEKLY')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h1 className="font-black text-2xl tracking-tighter text-slate-800">祺生园</h1>
          </div>
          <button onClick={handleReset} className="px-5 py-2.5 text-xs font-extrabold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm tracking-wide uppercase">
             重新配置
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
         {view === 'WEEKLY' && plan && (
            <WeeklyDashboard plan={plan} onSelectDay={handleDaySelect} />
         )}
         {view === 'DAILY' && plan && (
            <DailyDetailView 
              day={plan.days[selectedDayIndex]} 
              onBack={() => setView('WEEKLY')} 
              onMealClick={setSelectedMeal} 
              planType={plan.planType}
            />
         )}
      </main>
    </div>
  );
}