
import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Coordinates } from '../types';

interface Props {
  move: (dx: number, dy: number) => void;
  onCapture: () => void;
  isCapturing: boolean;
  pos: Coordinates;
  target: Coordinates;
  disabled?: boolean;
}

export const ControlPanel: React.FC<Props> = ({ move, onCapture, isCapturing, pos, target, disabled }) => {
  const dist = Math.sqrt(Math.pow(pos.x - target.x, 2) + Math.pow(pos.y - target.y, 2)).toFixed(1);

  return (
    <div className={`border-2 border-zinc-900 bg-zinc-950 p-4 flex flex-col gap-4 transition-opacity ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="space-y-1">
         <div className="flex items-center justify-between text-[8px] text-zinc-600 uppercase font-black">
            <span>Navigation</span>
            <span className="text-green-800">Linked</span>
         </div>
         <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full aspect-square max-w-[120px] mx-auto">
            <div />
            <ControlButton icon={<ChevronUp size={14}/>} onClick={() => move(0, -1)} />
            <div />
            <ControlButton icon={<ChevronLeft size={14}/>} onClick={() => move(-1, 0)} />
            <div className="bg-black flex items-center justify-center rounded-sm text-[8px] font-mono border border-zinc-900 text-zinc-400">
              {pos.x}:{pos.y}
            </div>
            <ControlButton icon={<ChevronRight size={14}/>} onClick={() => move(1, 0)} />
            <div />
            <ControlButton icon={<ChevronDown size={14}/>} onClick={() => move(0, 1)} />
            <div />
         </div>
      </div>

      <div className="space-y-2">
        <div className="bg-black border border-zinc-900 p-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-700 uppercase">Target Dist</span>
              <span className={`text-sm font-black font-mono ${parseFloat(dist) < 1.5 ? 'text-red-600' : 'text-zinc-400'}`}>
                {dist}m
              </span>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${parseFloat(dist) < 1.5 ? 'bg-red-600 animate-ping' : 'bg-zinc-800'}`}></div>
        </div>

        <button
          onClick={onCapture}
          disabled={isCapturing}
          className={`w-full py-4 flex flex-col items-center justify-center gap-1 border-b-4 transition-all active:border-b-0 active:translate-y-1 ${
            isCapturing 
            ? 'bg-zinc-900 border-zinc-950 text-zinc-600' 
            : 'bg-red-950 border-black text-red-200 hover:bg-red-800'
          }`}
        >
          <Camera size={16} className={isCapturing ? 'animate-spin' : ''} />
          <span className="font-black tracking-[0.2em] text-[9px] uppercase">Capture</span>
        </button>
      </div>

      <div className="text-[7px] text-zinc-800 font-mono space-y-0.5 italic pt-2 border-t border-zinc-900">
        <div>// NO_WAY_BACK</div>
        <div>// DATA_IS_BLOOD</div>
      </div>
    </div>
  );
};

const ControlButton = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-zinc-900 border border-zinc-800 text-zinc-600 hover:border-zinc-500 hover:text-white flex items-center justify-center rounded-sm transition-all active:bg-zinc-800"
  >
    {icon}
  </button>
);
