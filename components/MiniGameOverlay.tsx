
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MiniGameType } from '../types';
import { AlertTriangle, Cpu, Wind } from 'lucide-react';

interface Props {
  type: MiniGameType;
  onComplete: (success: boolean) => void;
}

export const MiniGameOverlay: React.FC<Props> = ({ type, onComplete }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-md animate-in zoom-in duration-300">
      <div className="w-full max-w-xs border-2 border-red-600 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(220,38,38,0.3)]">
        <div className="flex items-center gap-3 mb-6 border-b border-red-900/50 pb-2">
          {type === 'TIMING' ? <Wind className="text-blue-500" /> : <Cpu className="text-orange-500" />}
          <h2 className="text-red-500 font-black tracking-widest text-sm uppercase">
            {type === 'TIMING' ? 'O2 PUMP STALL' : 'THERMAL OVERLOAD'}
          </h2>
        </div>

        {type === 'TIMING' ? (
          <TimingGame onFinish={onComplete} />
        ) : (
          <SimonGame onFinish={onComplete} />
        )}

        <div className="mt-6 text-center">
          <div className="text-[9px] text-red-600 font-mono animate-pulse uppercase font-bold tracking-widest">
            Manual Override Sequence
          </div>
        </div>
      </div>
    </div>
  );
};

const TimingGame = ({ onFinish }: { onFinish: (s: boolean) => void }) => {
  const [pos, setPos] = useState(0);
  const directionRef = useRef(1);
  const posRef = useRef(0);
  const speed = 3.2; 

  useEffect(() => {
    let frameId: number;
    const update = () => {
      posRef.current += speed * directionRef.current;
      if (posRef.current >= 100) {
        posRef.current = 100;
        directionRef.current = -1;
      } else if (posRef.current <= 0) {
        posRef.current = 0;
        directionRef.current = 1;
      }
      setPos(posRef.current);
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handlePress = () => {
    if (posRef.current > 35 && posRef.current < 65) {
      onFinish(true);
    } else {
      onFinish(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="h-10 bg-zinc-900 relative border-2 border-zinc-800 overflow-hidden">
        <div className="absolute left-[35%] right-[35%] h-full bg-green-500/40 border-x-2 border-green-500/60 shadow-[inset_0_0_10px_green]"></div>
        <div 
          className="absolute top-0 bottom-0 w-2.5 bg-red-600 shadow-[0_0_20px_red]"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        ></div>
      </div>
      <button 
        onClick={handlePress}
        className="w-full py-5 bg-red-700 text-white font-black uppercase text-sm border-b-4 border-red-950 active:border-0 active:translate-y-1 cursor-pointer hover:bg-red-600 transition-all shadow-lg"
      >
        VENT NOW
      </button>
    </div>
  );
};

const SimonGame = ({ onFinish }: { onFinish: (s: boolean) => void }) => {
  const [sequence] = useState(() => Array.from({ length: 4 }).map(() => Math.floor(Math.random() * 4)));
  const [userInput, setUserInput] = useState<number[]>([]);
  const [showIndex, setShowIndex] = useState(-1);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setShowIndex(sequence[i]);
        setTimeout(() => setShowIndex(-1), 400);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [sequence]);

  const handleInput = (val: number) => {
    const newInput = [...userInput, val];
    setUserInput(newInput);
    
    if (sequence[newInput.length - 1] !== val) {
      onFinish(false);
      return;
    }

    if (newInput.length === sequence.length) {
      setTimeout(() => onFinish(true), 200);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1, 2, 3].map(i => (
        <button
          key={i}
          onClick={() => handleInput(i)}
          className={`aspect-square border-4 transition-all cursor-pointer ${
            showIndex === i 
            ? 'bg-orange-500 border-white shadow-[0_0_30px_orange] scale-95' 
            : 'bg-zinc-900 border-zinc-800 active:bg-zinc-700 active:scale-90 hover:border-zinc-500'
          }`}
        />
      ))}
    </div>
  );
};
