
import React, { useMemo, useState, useEffect } from 'react';
import { Coordinates, Rift } from '../types';

interface Props {
  pos: Coordinates;
  target: Coordinates;
  isCapturing: boolean;
  setHeat: React.Dispatch<React.SetStateAction<number>>;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;
  rifts: Rift[];
}

export const ViewPort: React.FC<Props> = ({ pos, target, isCapturing, setHeat, setEnergy, rifts }) => {
  const noise = useMemo(() => Array.from({ length: 64 }).map(() => Math.random() > 0.92), []);
  
  const [entities, setEntities] = useState(() => Array.from({ length: 3 }).map(() => ({
    id: Math.random(),
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
  })));

  const [isColliding, setIsColliding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEntities(prev => prev.map(e => {
        let nx = e.x + e.vx;
        let ny = e.y + e.vy;
        let nvx = e.vx;
        let nvy = e.vy;
        if (nx < 0 || nx > 100) nvx *= -1;
        if (ny < 0 || ny > 100) nvy *= -1;
        return { ...e, x: nx, y: ny, vx: nvx, vy: nvy };
      }));

      let colliding = false;
      rifts.forEach(rift => {
        const d = Math.sqrt(Math.pow(rift.worldX - pos.x, 2) + Math.pow(rift.worldY - pos.y, 2));
        if (d < rift.radius) {
          colliding = true;
          setHeat(h => Math.min(100, h + 0.8));
          setEnergy(e => Math.max(0, e - 0.3));
        }
      });
      setIsColliding(colliding);
    }, 100);
    return () => clearInterval(timer);
  }, [pos, rifts, setHeat, setEnergy]);

  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  const SCALE = 8; 
  const radarX = 50 + (dx * SCALE);
  const radarY = 50 + (dy * SCALE);

  return (
    <div className={`w-full h-full relative overflow-hidden flex items-center justify-center bg-zinc-950 transition-all ${isCapturing ? 'brightness-150 contrast-150' : ''} ${isColliding ? 'animate-pulse' : ''}`}>
      <div 
        className="absolute inset-[-100%] opacity-5 pointer-events-none transition-transform duration-500 ease-out" 
        style={{ 
          backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', 
          backgroundSize: '40px 40px',
          transform: `translate(${-pos.x * 2}%, ${-pos.y * 2}%)`
        }}
      ></div>

      {/* Improved Thermal Rift Indicators */}
      {rifts.map(rift => {
        const rx = 50 + (rift.worldX - pos.x) * SCALE;
        const ry = 50 + (rift.worldY - pos.y) * SCALE;
        const size = rift.radius * SCALE * 2;
        
        // Culling: don't render if too far off screen
        if (rx < -40 || rx > 140 || ry < -40 || ry > 140) return null;

        return (
          <div 
            key={rift.id}
            className="absolute rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out"
            style={{
              left: `${rx}%`,
              top: `${ry}%`,
              width: `${size}%`,
              height: `${size}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
             {/* Outer danger ring */}
             <div className="absolute inset-0 rounded-full border-4 border-red-600/20 animate-pulse" />
             <div className="absolute inset-2 rounded-full border border-red-500/40 animate-[ping_3s_infinite]" />
             
             {/* Inner core haze */}
             <div className="absolute inset-0 rounded-full bg-red-900/10 backdrop-blur-[1px] shadow-[inset_0_0_30px_rgba(220,38,38,0.2)]" />
             
             <div className="z-10 flex flex-col items-center">
                <div className="text-[7px] text-red-500 font-black tracking-[0.2em] animate-pulse drop-shadow-[0_0_2px_red]">
                  RIFT_0{rift.id}
                </div>
                <div className="text-[5px] text-red-700 font-bold uppercase mt-0.5 opacity-60">
                  Critical Heat Hazard
                </div>
             </div>
          </div>
        );
      })}

      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20 pointer-events-none">
        {noise.map((n, i) => <div key={i} className={`border-[0.2px] border-zinc-900 ${n ? 'bg-zinc-800' : ''}`}></div>)}
      </div>

      {/* Target/Anomaly Indicator (Blue - Distinct from Rifts) */}
      <div 
        className="absolute transition-all duration-1000 ease-out pointer-events-none"
        style={{
          left: `${radarX}%`,
          top: `${radarY}%`,
          opacity: Math.max(0, 1 - (dist / 10)),
          transform: `translate(-50%, -50%) scale(${Math.max(1, 4 - dist/2)})`,
        }}
      >
        <div className="w-16 h-16 rounded-full bg-blue-600/10 blur-2xl animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-blue-400 blur-[1px] absolute inset-0 m-auto"></div>
      </div>

      <div className={`absolute w-32 h-32 flex items-center justify-center pointer-events-none z-30 transition-transform ${isColliding ? 'scale-110' : ''}`}>
        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_white] ${isColliding ? 'bg-red-500' : 'bg-white'}`}></div>
        <div className={`absolute w-full h-[0.5px] ${isColliding ? 'bg-red-500/50' : 'bg-white/20'}`}></div>
        <div className={`absolute h-full w-[0.5px] ${isColliding ? 'bg-red-500/50' : 'bg-white/20'}`}></div>
        <div className={`absolute inset-4 border rounded-full ${isColliding ? 'border-red-500/40 animate-ping' : 'border-white/5'}`}></div>
      </div>

      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)] pointer-events-none"></div>
      
      {isColliding && (
        <div className="absolute top-1/4 w-full text-center text-red-600 font-black text-[10px] tracking-[0.5em] animate-pulse">
          WARNING: THERMAL INTEGRITY COMPROMISED
        </div>
      )}

      {isCapturing && (
        <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center z-[90] backdrop-blur-sm animate-in fade-in duration-75">
          <div className="text-white text-4xl font-black italic tracking-widest animate-pulse uppercase scale-110 transition-transform">Compressing Reality...</div>
        </div>
      )}
    </div>
  );
};
