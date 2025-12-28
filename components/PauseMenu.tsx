
import React from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

interface Props {
  onResume: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

export const PauseMenu: React.FC<Props> = ({ onResume, volume, setVolume }) => {
  return (
    <div className="absolute inset-0 z-[150] bg-black/80 flex items-center justify-center p-8 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm border-2 border-zinc-800 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-8">
        <h1 className="text-zinc-600 text-3xl font-black tracking-[0.4em] uppercase text-center border-b border-zinc-900 pb-4">
          Session Paused
        </h1>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
              <span className="flex items-center gap-2">
                {volume > 0 ? <Volume2 size={14}/> : <VolumeX size={14}/>}
                Audio Output
              </span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          <div className="text-[10px] text-zinc-700 italic text-center px-4">
            Warning: Simulation time is suspended. Oxygen scrubbers operating at minimum capacity.
          </div>
        </div>

        <button 
          onClick={onResume}
          className="w-full py-4 border-2 border-white/20 hover:border-white text-white/50 hover:text-white transition-all font-black text-xl tracking-[0.3em] uppercase flex items-center justify-center gap-3 group"
        >
          <Play size={20} className="fill-current group-hover:fill-white" />
          Resume
        </button>
      </div>
    </div>
  );
};
