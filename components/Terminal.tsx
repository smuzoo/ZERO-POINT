
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export const Terminal: React.FC<Props> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef}
      className="h-full p-4 overflow-y-auto scrollbar-hide text-[10px] space-y-1.5 font-mono selection:bg-red-900 selection:text-white"
    >
      {logs.map((log, i) => (
        <div key={i} className={`flex gap-2 ${log.source === 'UNKNOWN' ? 'animate-pulse' : ''}`}>
          <span className="text-zinc-800 shrink-0">[{log.timestamp}]</span>
          <span className={`shrink-0 font-bold ${
            log.source === 'CORP' ? 'text-amber-700' : 
            log.source === 'SYSTEM' ? 'text-zinc-600' : 
            log.source === 'UNKNOWN' ? 'text-red-700' : 'text-green-800'
          }`}>
            {log.source}:
          </span>
          <span className={`
            ${log.source === 'CORP' ? 'text-amber-200' : 
              log.source === 'UNKNOWN' ? 'text-red-400 font-bold italic' : 'text-green-500'}
          `}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
};
