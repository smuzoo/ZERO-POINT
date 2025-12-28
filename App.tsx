
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Coordinates, Anomaly, LogEntry, MiniGameType } from './types';
import { getAnalysis } from './services/geminiService';
import { Terminal } from './components/Terminal';
import { ViewPort } from './components/ViewPort';
import { ControlPanel } from './components/ControlPanel';
import { MiniGameOverlay } from './components/MiniGameOverlay';
import { AlertCircle, Thermometer, Wind, Zap } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_OXYGEN = 100;
const INITIAL_ENERGY = 100;
const O2_DRAIN_BASE = 0.55; 
const HEAT_INC_BASE = 0.15;
const ENERGY_DRAIN_BASE = 0.08;

const ANOMALIES_LIST: Anomaly[] = [
  { id: '1', pos: { x: 5, y: 15 }, name: 'Structure Alpha', found: false, description: '', visualData: '' },
  { id: '2', pos: { x: 14, y: 4 }, name: 'Pattern Gamma', found: false, description: '', visualData: '' },
  { id: '3', pos: { x: 2, y: 8 }, name: 'Echo Omega', found: false, description: '', visualData: '' },
  { id: 'FINAL', pos: { x: 10, y: 10 }, name: 'The Origin', found: false, description: '', visualData: '' },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.LORE);
  const [pos, setPos] = useState({ x: 10, y: 10 });
  const [oxygen, setOxygen] = useState(INITIAL_OXYGEN);
  const [energy, setEnergy] = useState(INITIAL_ENERGY);
  const [heat, setHeat] = useState(40);
  const [deathCause, setDeathCause] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(ANOMALIES_LIST);
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedData, setCapturedData] = useState<null | { name: string, desc: string }>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);

  const addLog = useCallback((message: string, source: LogEntry['source'] = 'SYSTEM') => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), source, message }].slice(-15));
  }, []);

  const resetAll = useCallback(() => {
    setPos({ x: 10, y: 10 });
    setOxygen(INITIAL_OXYGEN);
    setEnergy(INITIAL_ENERGY);
    setHeat(40);
    setDeathCause('');
    setLogs([]);
    setAnomalies(ANOMALIES_LIST.map(a => ({ ...a, found: false })));
    setCurrentTargetIdx(0);
    setIsCapturing(false);
    setCapturedData(null);
    setActiveMiniGame(null);
    setGameState(GameState.BOOT);
  }, []);

  useEffect(() => {
    if (gameState === GameState.LORE) {
      const timer = setTimeout(() => setGameState(GameState.BOOT), 6000);
      return () => clearTimeout(timer);
    }
    if (gameState === GameState.BOOT) {
      const timer = setTimeout(() => {
        setGameState(GameState.ACTIVE);
        addLog("THERMOS-4 SYSTEM INITIALIZED", "SYSTEM");
        addLog("WELCOME PILOT. COMMENCING INDEXING.", "CORP");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, addLog]);

  useEffect(() => {
    if (gameState === GameState.ACTIVE || gameState === GameState.MINIGAME) {
      const interval = setInterval(() => {
        setOxygen(prev => Math.max(0, prev - O2_DRAIN_BASE));
        setEnergy(prev => Math.max(0, prev - ENERGY_DRAIN_BASE));
        setHeat(prev => Math.min(100, Math.max(20, prev + HEAT_INC_BASE)));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.ACTIVE) {
      const trigger = setInterval(() => {
        if (Math.random() > 0.72 && !activeMiniGame) {
          const type: MiniGameType = Math.random() > 0.5 ? 'TIMING' : 'SIMON';
          setActiveMiniGame(type);
          setGameState(GameState.MINIGAME);
        }
      }, 10000);
      return () => clearInterval(trigger);
    }
  }, [gameState, activeMiniGame]);

  useEffect(() => {
    if (gameState === GameState.ACTIVE || gameState === GameState.MINIGAME) {
      if (oxygen <= 0) {
        setDeathCause('ASPHYXIATION: O2 DEPLETED');
        setGameState(GameState.DEATH);
      } else if (energy <= 0) {
        setDeathCause('POWER LOSS: CORE EXHAUSTED');
        setGameState(GameState.DEATH);
      } else if (heat >= 100) {
        setDeathCause('CRITICAL OVERHEAT: HULL MELT');
        setGameState(GameState.DEATH);
      }
    }
  }, [oxygen, energy, heat, gameState]);

  const move = (dx: number, dy: number) => {
    if (gameState !== GameState.ACTIVE) return;
    const newX = Math.min(Math.max(0, pos.x + dx), GRID_SIZE - 1);
    const newY = Math.min(Math.max(0, pos.y + dy), GRID_SIZE - 1);
    if (newX !== pos.x || newY !== pos.y) {
      setPos({ x: newX, y: newY });
      setOxygen(prev => prev - 0.8); 
      setHeat(prev => Math.max(20, prev - 3.0)); 
      addLog(`MOVE: [${newX}, ${newY}]`, "SYSTEM");
    }
  };

  const handleCapture = async () => {
    if (isCapturing || gameState !== GameState.ACTIVE) return;
    setIsCapturing(true);
    addLog("COLLAPSING FIELD...", "SYSTEM");
    
    const target = anomalies[currentTargetIdx];
    const dist = Math.sqrt(Math.pow(pos.x - target.pos.x, 2) + Math.pow(pos.y - target.pos.y, 2));

    setTimeout(async () => {
      if (dist < 1.5) {
        if (target.id === 'FINAL') {
          setGameState(GameState.ENDING);
          return;
        }
        const analysis = await getAnalysis(target.name);
        setCapturedData({ name: target.name, desc: analysis || "DATA_MISSING" });
        setAnomalies(prev => prev.map((a, i) => i === currentTargetIdx ? { ...a, found: true } : a));
        setCurrentTargetIdx(prev => prev + 1);
        setGameState(GameState.PHOTO_VIEW);
        setOxygen(prev => Math.min(100, prev + 50));
        setEnergy(prev => Math.min(100, prev + 20));
      } else {
        addLog("SIGNAL LOST: TARGET MISALIGNED", "SYSTEM");
      }
      setIsCapturing(false);
    }, 1200); 
  };

  const resolveMiniGame = (success: boolean) => {
    if (success) {
      if (activeMiniGame === 'SIMON') setHeat(prev => Math.max(20, prev - 30));
      if (activeMiniGame === 'TIMING') setOxygen(prev => Math.min(100, prev + 30));
      addLog("OVERRIDE SUCCESSFUL", "SYSTEM");
    } else {
      setOxygen(prev => Math.max(5, prev - 20));
      setHeat(prev => Math.min(95, prev + 25));
      addLog("OVERRIDE FAILED: RESOURCE LOSS", "SYSTEM");
    }
    setActiveMiniGame(null);
    setGameState(GameState.ACTIVE);
  };

  if (gameState === GameState.LORE) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-12 text-center font-bold tracking-[0.3em] leading-loose">
        <div className="space-y-6 animate-in fade-in duration-[4000ms]">
          <p className="text-red-500 text-2xl uppercase">Biology is obsolete.</p>
          <p className="text-red-600 text-2xl uppercase">Mankind is Data.</p>
          <p className="text-red-700 text-2xl uppercase">Observation is Fuel.</p>
          <p className="text-red-900 text-3xl uppercase">The Archive is Full.</p>
        </div>
      </div>
    );
  }

  if (gameState === GameState.DEATH) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-red-600 p-8 text-center space-y-10 z-[9999]">
        <AlertCircle size={100} className="animate-pulse" />
        <div className="space-y-4">
           <h1 className="text-5xl font-black tracking-tighter uppercase">Subject Purged</h1>
           <div className="p-4 border-2 border-red-900 bg-red-900/10 inline-block font-bold">
              {deathCause || 'UNKNOWN SYSTEM COLLAPSE'}
           </div>
           <p className="text-zinc-600 font-bold max-w-md mx-auto">PILOT TERMINATED FOR EXCESSIVE RESOURCE DEVIATION. ALL CAPTURED DATA HAS BEEN SECURED. UNIT IS NOW DISPOSABLE.</p>
        </div>
        <button onClick={resetAll} className="px-12 py-4 border-4 border-red-700 hover:bg-red-700 hover:text-white transition-all font-black text-xl uppercase tracking-widest cursor-pointer">Reboot Unit</button>
      </div>
    );
  }

  if (gameState === GameState.ENDING) return <EndingSequence onReset={resetAll} />;

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-black p-4 gap-4 font-mono text-green-500 overflow-hidden text-lg">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 relative border-4 border-zinc-900 bg-zinc-950 overflow-hidden shadow-[inset_0_0_100px_black]">
          <ViewPort 
            pos={pos} 
            target={anomalies[currentTargetIdx].pos} 
            isCapturing={isCapturing} 
            setHeat={setHeat} 
            setEnergy={setEnergy} 
          />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 text-xs font-bold">
            <div className={`px-3 py-1 border border-zinc-800 flex items-center gap-2 ${heat > 80 ? 'bg-red-900/40 border-red-500 text-red-500' : 'bg-black/80 text-orange-500'}`}>
              <Thermometer size={14}/> {heat.toFixed(1)}°C
            </div>
            <div className={`px-3 py-1 border border-zinc-800 flex items-center gap-2 ${oxygen < 30 ? 'bg-red-900/40 border-red-500 text-red-500' : 'bg-black/80 text-blue-400'}`}>
              <Wind size={14}/> {oxygen.toFixed(1)}%
            </div>
            <div className={`px-3 py-1 border border-zinc-800 flex items-center gap-2 ${energy < 20 ? 'bg-red-900/40 border-red-500 text-red-500' : 'bg-black/80 text-yellow-600'}`}>
              <Zap size={14}/> {energy.toFixed(1)}%
            </div>
          </div>

          {gameState === GameState.MINIGAME && <MiniGameOverlay type={activeMiniGame!} onComplete={resolveMiniGame} />}

          {gameState === GameState.PHOTO_VIEW && capturedData && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 text-center z-50 animate-in fade-in zoom-in duration-300">
                <div className="w-full max-w-xl flex flex-col items-center gap-3">
                    <div className="border-4 border-zinc-800 bg-zinc-950 p-1">
                       <img src={`https://picsum.photos/seed/${capturedData.name}/800/600?grayscale`} className="max-h-[35vh] w-auto opacity-70 grayscale brightness-90" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-red-600 uppercase underline mb-1 tracking-widest">{capturedData.name}</h3>
                      <p className="text-zinc-400 text-[11px] leading-tight italic px-6">"{capturedData.desc}"</p>
                    </div>
                    <button onClick={() => setGameState(GameState.ACTIVE)} className="mt-2 px-8 py-2 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase text-xs tracking-widest">Close Record</button>
                </div>
            </div>
          )}
        </div>
        <div className="h-1/3 border-4 border-zinc-900 bg-zinc-950"><Terminal logs={logs} /></div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <ControlPanel move={move} onCapture={handleCapture} isCapturing={isCapturing} pos={pos} target={anomalies[currentTargetIdx].pos} disabled={gameState === GameState.MINIGAME || gameState === GameState.PHOTO_VIEW} />
        <div className="flex-1 border-4 border-zinc-900 bg-zinc-950 p-4 space-y-4 text-xs">
          <h2 className="font-black border-b border-zinc-800 pb-2 uppercase text-zinc-600">Index Progress</h2>
          <div className="space-y-2">
            {anomalies.map((a, i) => (
              <div key={a.id} className={`flex items-center gap-2 ${a.found ? 'text-green-800' : currentTargetIdx === i ? 'text-yellow-600 animate-pulse' : 'text-zinc-800'}`}>
                <div className={`w-2 h-2 ${a.found ? 'bg-green-800' : 'bg-current'}`}></div>
                ID: {a.id}
                {a.found && <span className="ml-auto text-[9px] opacity-40">STORED</span>}
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-zinc-900 opacity-30 text-[9px] leading-tight font-mono">
             CAUTION: THERMAL RIFTS DETECTED. DO NOT OVERLAP WITH RED SECTORS.
          </div>
        </div>
      </div>
    </div>
  );
}

function EndingSequence({ onReset }: { onReset: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 5000), 
      setTimeout(() => setStep(2), 11000),
      setTimeout(() => setStep(3), 18000),
      setTimeout(() => setStep(4), 26000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-12 text-center space-y-16 animate-in fade-in duration-[3000ms] font-mono text-white relative overflow-hidden">
      {step === 0 && (
        <div className="space-y-4 animate-pulse">
           <p className="text-zinc-600 tracking-[0.8em] text-lg uppercase">Compiling Subject #38292...</p>
           <p className="text-zinc-800 text-xs uppercase">Observation cycles finalized.</p>
        </div>
      )}
      
      {step === 1 && (
        <div className="space-y-10 animate-in slide-in-from-bottom duration-1000">
           <div className="border-8 border-red-600 p-2 bg-zinc-900 inline-block shadow-[0_0_100px_rgba(220,38,38,0.4)]">
             <img src="https://picsum.photos/seed/capsuleback/800/600?grayscale" className="grayscale contrast-200 opacity-95 max-h-[50vh]" />
           </div>
           <div className="space-y-4">
              <p className="text-red-500 text-2xl font-black italic tracking-[0.3em] uppercase underline">You are not the pilot.</p>
              <p className="text-zinc-500 text-sm font-bold uppercase">You are the storage medium.</p>
           </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-12 max-w-4xl animate-in zoom-in duration-1000">
           <div className="space-y-6">
              <p className="text-5xl font-black leading-tight text-white tracking-tighter">
                "BIOLOGY IS OBSOLETE."
              </p>
              <div className="h-0.5 w-full bg-red-900"></div>
              <p className="text-xl text-zinc-400 font-bold uppercase leading-relaxed">
                Your brain has been overwritten. Your memories are now 4TB of compressed reality layers.
                You are a <span className="text-red-600">living disk</span>.
              </p>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-10 animate-in fade-in duration-2000 flex flex-col items-center w-full">
           <div className="relative w-full h-64 overflow-hidden border-y border-zinc-800 flex items-center justify-center">
             {/* Simulating rows of capsules in ice */}
             <div className="flex gap-4 opacity-40 animate-pulse">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="w-16 h-32 border border-zinc-700 bg-zinc-900 flex-shrink-0 flex items-end p-1">
                    <div className="w-full h-2 bg-red-900/50"></div>
                  </div>
                ))}
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
           </div>
           <div className="space-y-4">
              <p className="text-zinc-500 text-sm tracking-[0.5em] font-black uppercase">Archive Sector 14-B // Row 1029</p>
              <p className="text-zinc-600 text-xs italic max-w-lg mx-auto">
                Thousands of capsules. Thousands of 'lives' frozen in the ice. 
                Each is a single layer of the index. You are part of the Library now.
              </p>
           </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col items-center justify-center space-y-24 animate-in fade-in duration-[3000ms]">
           <div className="text-9xl font-black text-white tracking-[0.4em] drop-shadow-[0_0_100px_rgba(255,255,255,0.4)]">SAVED</div>
           <button 
             onClick={onReset} 
             className="px-20 py-8 border-2 border-white/20 hover:border-white text-white/50 hover:text-white transition-all font-black text-3xl tracking-[0.5em] uppercase cursor-pointer"
           >
             Next Entry
           </button>
        </div>
      )}
    </div>
  );
}
