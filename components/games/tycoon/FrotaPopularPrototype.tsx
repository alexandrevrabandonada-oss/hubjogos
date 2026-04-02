'use client';

import React, { useState, useEffect, useRef } from 'react';

// Anti-Dashboard 2D Tycoon Map Prototype
// Focuses entirely on visible queues, moving vehicles, and route creation.

type NodeId = 'hub_belford' | 'lote_xv' | 'bom_pastor' | 'heliopolis' | 'upa';

interface MapNode {
  id: NodeId;
  label: string;
  x: number;
  y: number;
  isHub?: boolean;
  type?: 'station' | 'shelter' | 'upa';
}

interface Waypoint {
  id: string;
  x: number;
  y: number;
}

interface Vehicle {
  id: string;
  type: 'kombi' | 'van';
  capacity: number;
  passengers: number;
  baseRoute: [NodeId, NodeId];
  pathWaypoints: Waypoint[];
  waypointIndex: number;
  position: { x: number; y: number };
  state: 'moving' | 'boarding' | 'unboarding';
  timer: number;
  direction: 1 | -1; 
}

const NODES: MapNode[] = [
  { id: 'hub_belford', label: 'Estação SuperVia', x: 50, y: 85, isHub: true, type: 'station' },
  { id: 'lote_xv', label: 'Lote XV', x: 15, y: 15, type: 'shelter' },
  { id: 'bom_pastor', label: 'Bom Pastor', x: 85, y: 25, type: 'shelter' },
  { id: 'heliopolis', label: 'Heliópolis', x: 50, y: 40, type: 'shelter' },
  { id: 'upa', label: 'UPA 24h', x: 85, y: 65, type: 'upa' },
];

const JUNCTIONS: Waypoint[] = [
  { id: 'j1', x: 50, y: 65 }, 
  { id: 'j2', x: 15, y: 65 }, 
  { id: 'j3', x: 85, y: 45 }, 
];

// Visual Components - Silhouettes
const KombiIcon = ({ passengers }: { passengers: number }) => (
  <svg width="32" height="18" viewBox="0 0 32 18" className="drop-shadow-md">
    <rect x="2" y="4" width="28" height="12" rx="2" fill="white" />
    <rect x="22" y="6" width="6" height="8" rx="1" fill="#93C5FD" />
    <rect x="4" y="6" width="16" height="2" rx="0.5" fill="#E5E7EB" />
    <circle cx="8" cy="16" r="2" fill="#111827" />
    <circle cx="24" cy="16" r="2" fill="#111827" />
    {passengers > 0 && <circle cx="16" cy="10" r="3" fill="#3B82F6" className="animate-pulse" />}
  </svg>
);

const VanIcon = ({ passengers }: { passengers: number }) => (
  <svg width="42" height="22" viewBox="0 0 42 22" className="drop-shadow-md">
    <rect x="2" y="4" width="38" height="14" rx="2" fill="#F8FAFC" />
    <rect x="32" y="6" width="6" height="10" rx="1" fill="#93C5FD" />
    <rect x="6" y="6" width="24" height="2" rx="0.5" fill="#E5E7EB" />
    <circle cx="10" cy="18" r="2.5" fill="#111827" />
    <circle cx="32" cy="18" r="2.5" fill="#111827" />
    {passengers > 0 && <circle cx="20" cy="11" r="4" fill="#2563EB" className="animate-pulse" />}
  </svg>
);

const NodeVisual = ({ type, isHub, label }: { type?: string, isHub?: boolean, label: string }) => {
  if (isHub) return (
    <div className="relative flex flex-col items-center">
      <svg width="100" height="80" viewBox="0 0 100 80">
        <rect x="10" y="40" width="80" height="35" rx="4" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
        <rect x="20" y="20" width="60" height="25" rx="2" fill="#2563EB" />
        <path d="M10 40 L50 10 L90 40 Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
      </svg>
      <span className="text-[10px] font-black uppercase tracking-tighter mt-1 bg-blue-900/80 px-2 py-0.5 rounded shadow-sm">{label}</span>
    </div>
  );
  if (type === 'upa') return (
    <div className="relative flex flex-col items-center">
      <svg width="60" height="50" viewBox="0 0 60 50">
        <rect x="5" y="15" width="50" height="30" rx="2" fill="#4B5563" stroke="#9CA3AF" strokeWidth="2" />
        <rect x="25" y="10" width="10" height="15" fill="#EF4444" />
        <rect x="20" y="25" width="20" height="10" fill="white" opacity="0.3" />
      </svg>
      <span className="text-[9px] font-bold uppercase mt-1 bg-gray-800/80 px-1 rounded">{label}</span>
    </div>
  );
  return (
    <div className="relative flex flex-col items-center">
      <svg width="50" height="40" viewBox="0 0 50 40">
        <rect x="15" y="25" width="20" height="10" rx="1" fill="#374151" />
        <path d="M10 25 L40 25 L50 20 L0 20 Z" fill="#6B7280" />
        <rect x="22" y="10" width="6" height="15" fill="#9CA3AF" />
      </svg>
      <span className="text-[9px] font-medium uppercase mt-1 text-gray-300">{label}</span>
    </div>
  );
};

const getPath = (start: NodeId, end: NodeId): Waypoint[] => {
  const s = NODES.find(n => n.id === start)!;
  const e = NODES.find(n => n.id === end)!;
  const j1 = JUNCTIONS.find(j => j.id === 'j1')!;
  const j2 = JUNCTIONS.find(j => j.id === 'j2')!;
  const j3 = JUNCTIONS.find(j => j.id === 'j3')!;

  if (start === 'hub_belford') {
    if (end === 'lote_xv') return [s, j1, j2, e];
    if (end === 'heliopolis') return [s, j1, e];
    return [s, j1, j3, e];
  }
  if (end === 'hub_belford') {
    if (start === 'lote_xv') return [s, j2, j1, e];
    if (start === 'heliopolis') return [s, j1, e];
    return [s, j3, j1, e];
  }
  return [s, e];
};


export const FrotaPopularPrototype: React.FC = () => {
  const [queues, setQueues] = useState<Record<NodeId, number>>({
    hub_belford: 0,
    lote_xv: 10,
    bom_pastor: 5,
    heliopolis: 8,
    upa: 5,
  });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetPool, setFleetPool] = useState(24); // T138: Last Fairness Pass buffer from 22 to 24
  const [dispatchCooldown, setDispatchCooldown] = useState(0);
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [lastDispatchTarget, setLastDispatchTarget] = useState<NodeId | null>(null); // T131: Flash feedback
  const [gameState, setGameState] = useState<'playing' | 'won' | 'failed'>('playing');
  const [segmentHeat, setSegmentHeat] = useState<Record<string, number>>({}); // T131: Congestion visibility

  
  // T145: State-to-Ref synchronization for high-frequency game loop stability
  const gameStateRef = useRef(gameState);
  const queuesRef = useRef(queues);
  const vehiclesRef = useRef(vehicles);
  const dispatchCooldownRef = useRef(dispatchCooldown);
  const fleetPoolRef = useRef(fleetPool);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { queuesRef.current = queues; }, [queues]);
  useEffect(() => { vehiclesRef.current = vehicles; }, [vehicles]);
  useEffect(() => { dispatchCooldownRef.current = dispatchCooldown; }, [dispatchCooldown]);
  useEffect(() => { fleetPoolRef.current = fleetPool; }, [fleetPool]);


  const [time, setTime] = useState(6 * 60); 
  const tickCounterRef = useRef(0); // T136: Track ticks for time stretching (ref avoids unused-state error)

  // T139: Session telemetry — written imperatively to avoid stale-closure issues inside nested updaters
  const telemetryRef = useRef({
    startedAt: Date.now(),
    totalDispatches: 0,
    firstDispatchOffsetSeconds: null as number | null,
    drainEvents: 0,
    drainDuring0800Band: false,
    sessionDurationSeconds: 0,
  });

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // T136: Time Stretching - Increment time every 2nd tick (400ms/min)
      tickCounterRef.current += 1;
      if (tickCounterRef.current % 2 === 0) {
        setTime(t => {
          const nextTime = t + 1;
          if (nextTime === 6 * 60 + 5) {
            setQueues(q => ({
              ...q,
              lote_xv: q.lote_xv + 16,
              heliopolis: q.heliopolis + 14,
              bom_pastor: q.bom_pastor + 12,
            }));
          }
          if (nextTime === 8 * 60) {
            setQueues(q => ({
              ...q,
              lote_xv: q.lote_xv + 6, // T138: Compressed 08:00 rush from +10 to +6
              upa: q.upa + 8,
            }));
          }
          if (nextTime >= 10 * 60) {
            telemetryRef.current.sessionDurationSeconds = Math.round((Date.now() - telemetryRef.current.startedAt) / 1000); // T139
            const total = Object.values(queuesRef.current).reduce((a, b) => a + b, 0);
            if (total < 50) setGameState('won'); 
            else setGameState('failed');
          }
          return nextTime;
        });
      }

      if (Math.random() < 0.04) { // T136: Reduced from 0.05 to 0.04
        const nodes: NodeId[] = ['lote_xv', 'bom_pastor', 'heliopolis', 'upa'];
        const r = nodes[Math.floor(Math.random() * nodes.length)];
        setQueues(q => ({ ...q, [r]: q[r] + 1 }));
      }

      setDispatchCooldown(d => d > 0 ? d - 1 : 0);

      const counts: Record<string, number> = {};
      
      setVehicles(prev => {
        const nextVehicles = prev.map(v => {
          const next = { ...v };
          const targetWp = v.pathWaypoints[v.waypointIndex];
          
          if (v.state === 'moving') {
            const dx = targetWp.x - v.position.x;
            const dy = targetWp.y - v.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const segId = `${v.waypointIndex}-${v.direction}-${v.baseRoute[1]}`;
            counts[segId] = (counts[segId] || 0) + 1;
            const speedMult = 1.0 / (1 + Math.max(0, counts[segId] - 1) * 0.15); // T136: Penalty halved from 0.3 to 0.15
            const speed = (v.type === 'kombi' ? 2.2 : 1.5) * speedMult; // T136: Buffed from 1.8/1.2

            if (dist < speed) {
              next.position = { x: targetWp.x, y: targetWp.y };
              const isLast = v.waypointIndex === (v.direction === 1 ? v.pathWaypoints.length - 1 : 0);
              
              if (isLast) {
                next.state = v.direction === 1 ? 'boarding' : 'unboarding';
                next.timer = v.direction === 1 ? 6 : 4; // T136: Reduced from 10/6 to accelerate turnaround
              } else {
                next.waypointIndex += v.direction;
              }
            } else {
              next.position.x += (dx / dist) * speed;
              next.position.y += (dy / dist) * speed;
            }
          } 
          else if (v.state === 'boarding' || v.state === 'unboarding') {
            next.timer--;
            if (next.timer <= 0) {
              const currNodeId = v.baseRoute[v.direction === 1 ? 1 : 0];
              if (v.state === 'boarding') {
                const space = v.capacity - v.passengers;
                const taking = Math.min(space, queuesRef.current[currNodeId]);
                setQueues(q => ({ ...q, [currNodeId]: q[currNodeId] - taking }));
                next.passengers += taking;
                next.direction = -1;
                next.state = 'moving';
                next.waypointIndex += next.direction;
              } else {
                // T136: Dynamic Return to Pool logic
                setFleetPool(fp => fp + 1);
                return null; // Mark for removal
              }
            }
          }
          return next;
        }).filter(v => v !== null) as Vehicle[];
        return nextVehicles;
      });

      setSegmentHeat(counts);
    }, 200);


    return () => clearInterval(interval);
  }, [gameState]);

  const handleNodeClick = (id: NodeId) => {
    if (gameState !== 'playing') return;
    
    // T136: Optimized One-Click Dispatch
    if (id !== 'hub_belford') {
      setSelectedNode(id);
      if (fleetPool > 0 && dispatchCooldown <= 0) {
        const path = getPath('hub_belford', id);
        const type = Math.random() > 0.4 ? 'van' : 'kombi';
        setVehicles(v => [...v, {
          id: Math.random().toString(),
          type,
          capacity: type === 'van' ? 15 : 10,
          passengers: 0,
          baseRoute: ['hub_belford', id],
          pathWaypoints: path,
          waypointIndex: 1,
          position: { x: path[0].x, y: path[0].y },
          state: 'moving',
          timer: 0,
          direction: 1,
        }]);
        setFleetPool(p => p - 1);
        // T139: Telemetry tracking
        telemetryRef.current.totalDispatches++;
        if (telemetryRef.current.firstDispatchOffsetSeconds === null) {
          telemetryRef.current.firstDispatchOffsetSeconds = Math.round((Date.now() - telemetryRef.current.startedAt) / 1000);
        }
        if (fleetPool === 1) {
          telemetryRef.current.drainEvents++;
          if (time >= 8 * 60 && time < 9 * 60) telemetryRef.current.drainDuring0800Band = true;
        }
        setDispatchCooldown(2); // T136: Burst dispatch from 6 to 2 (0.4s)
        setLastDispatchTarget(id);
        setTimeout(() => {
          setLastDispatchTarget(null);
          setSelectedNode(null);
        }, 500); // T136: Faster visual feedback clear
      }
    } else {
      setSelectedNode(null);
    }
  };
  return (
    <div className="w-full h-[calc(100dvh-130px)] md:h-screen bg-[#0F172A] text-white overflow-hidden relative font-sans select-none">
      {/* HUD Layer - Fixed positioning for reachability on all viewports */}
      <div className="w-full p-2 md:p-4 z-[60] absolute top-0 left-0 md:top-4 md:left-4 md:w-auto gap-2 pointer-events-none">


        <div className="bg-[#1E293B]/80 p-3 md:p-5 rounded-2xl backdrop-blur-xl border border-white/5 shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-start md:block">
            <div>
              <p className="hidden md:block text-[10px] md:text-xs font-bold text-blue-300 tracking-tighter uppercase whitespace-break-spaces">MISSÃO: Clique nas comunidades para despachar vans e esvaziar as filas.</p>
              <h1 className="text-sm md:text-xl font-black text-blue-400 uppercase tracking-widest leading-none">Frota Popular</h1>
              <p className="text-[7px] md:text-[10px] text-blue-300/60 uppercase font-bold mt-0.5">Belford Roxo V1</p>
            </div>
            <div className="md:mt-4 flex items-baseline gap-1 md:gap-2">
              <div className="text-xl md:text-4xl font-mono font-black text-white leading-none">{formatTime(time)}</div>
              <div className={`text-[8px] md:text-xs font-bold px-2 py-0.5 rounded ${time < 8*60 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400 animate-pulse'}`}>
                {time < 9*60 ? 'RUSH DA MANHÃ' : 'HORA CRÍTICA'}
              </div>
            </div>
          </div>

          <div className="mt-2 md:mt-6 grid grid-cols-2 gap-2 md:gap-4">
            <div className="bg-white/5 p-1.5 md:p-3 rounded-xl border border-white/5">
              <p className="text-[7px] md:text-[10px] text-gray-400 font-bold uppercase mb-0.5">Frota</p>
              <div className="text-sm md:text-2xl font-mono font-bold flex items-center gap-1 md:gap-2">
                <span className={fleetPool === 0 ? 'text-red-500' : 'text-blue-400'}>{fleetPool}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`w-1 h-2 md:w-1.5 md:h-3 rounded-full ${i < Math.ceil(fleetPool / 2) ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-2 md:p-3 rounded-xl border border-white/5">
              <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase mb-1">Despacho</p>
              <div className={`h-1.5 md:h-2 rounded-full bg-white/10 mt-2 overflow-hidden`}>
                <div className="h-full bg-blue-500 transition-all shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${(1 - dispatchCooldown/12) * 100}%` }} />
              </div>
            </div>
          </div>

          <p className="hidden md:block mt-4 text-[10px] text-gray-400 max-w-[220px] leading-relaxed">
            <span className="text-blue-400 font-bold">MISSÃO:</span> Evite o colapso nos pontos.{' '}
            <span className="text-white font-bold">Clique numa comunidade</span> para despachar imediatamente.
          </p>
        </div>
      </div>


      {/* Result Overlay */}
      {gameState !== 'playing' && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="bg-[#1E293B] p-10 rounded-3xl border border-white/10 shadow-2xl max-w-md">
            <h2 className={`text-5xl font-black uppercase mb-4 ${gameState === 'won' ? 'text-green-400' : 'text-red-500'}`}>
              {gameState === 'won' ? 'Fluxo Estabilizado' : 'Sistema em Colapso'}
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {gameState === 'won' 
                ? 'Você conseguiu conter o surto da manhã. A população chegou ao trabalho sem grandes atrasos.' 
                : 'As filas superaram a capacidade da frota popular. Belford Roxo parou hoje.'}
            </p>
            {/* T139: Session telemetry panel */}
            <div className="mb-6 text-left bg-black/30 rounded-xl p-4 text-xs font-mono text-gray-400 space-y-1 border border-white/5">
              <div className="text-gray-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Dados da sessão</div>
              <div>Despachos: <span className="text-white">{telemetryRef.current.totalDispatches}</span></div>
              <div>Drenos de frota: <span className={telemetryRef.current.drainEvents > 0 ? 'text-red-400' : 'text-green-400'}>{telemetryRef.current.drainEvents}</span></div>
              <div>Dreno às 08:00: <span className={telemetryRef.current.drainDuring0800Band ? 'text-red-400' : 'text-gray-500'}>{telemetryRef.current.drainDuring0800Band ? 'SIM' : 'NÃO'}</span></div>
              <div>1º despacho: <span className="text-white">{telemetryRef.current.firstDispatchOffsetSeconds !== null ? `${telemetryRef.current.firstDispatchOffsetSeconds}s` : '—'}</span></div>
              <div>Duração: <span className="text-white">{telemetryRef.current.sessionDurationSeconds}s</span></div>
            </div>
            <button
              onClick={() => {
                const d = telemetryRef.current;
                navigator.clipboard.writeText(JSON.stringify({
                  build: 'T138',
                  outcome: gameState,
                  totalDispatches: d.totalDispatches,
                  firstDispatchOffsetSeconds: d.firstDispatchOffsetSeconds,
                  drainEvents: d.drainEvents,
                  drainDuring0800Band: d.drainDuring0800Band,
                  sessionDurationSeconds: d.sessionDurationSeconds,
                  recordedAt: new Date().toISOString(),
                }, null, 2));
              }}
              className="mb-4 w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-4 py-2 rounded-xl transition-all text-xs uppercase tracking-widest border border-white/10"
            >
              Copiar dados da sessão
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-all uppercase tracking-widest"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Road Network with Congestion Feedback */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <path d="M 50,85 L 50,65 L 15,65 L 15,15" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
        <path d="M 50,65 L 50,40" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
        <path d="M 50,65 L 85,45 L 85,25" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
        <path d="M 85,45 L 85,65" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
        
        {/* Congestion Glow Segments */}
        {Object.entries(segmentHeat).map(([segId, count]) => {
          if (count < 2) return null;
          const [wpIdxStr, dirStr, targetId] = segId.split('-');
          const wpIdx = parseInt(wpIdxStr);
          const dir = parseInt(dirStr);
          
          // Find a vehicle on this specific segment to get the path
          const v = vehicles.find(veh => veh.baseRoute[1] === targetId && veh.direction === dir);
          if (!v || !v.pathWaypoints) return null;
          
          const startWp = v.pathWaypoints[wpIdx - (dir === 1 ? 1 : 0)];
          const endWp = v.pathWaypoints[wpIdx + (dir === -1 ? 1 : 0)];
          
          if (!startWp || !endWp) return null;

          return (
            <path 
              key={`heat-${segId}`}
              d={`M ${startWp.x},${startWp.y} L ${endWp.x},${endWp.y}`}
              stroke={count >= 4 ? '#EF4444' : '#F59E0B'}
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              opacity={0.8}
            />
          );
        })}


        {/* Dotted lines for active routes */}
        {vehicles.map(v => (
          <path 
            key={`path-${v.id}`}
            d={`M ${v.pathWaypoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
            stroke={lastDispatchTarget === v.baseRoute[1] ? '#60A5FA' : '#3B82F6'}
            strokeWidth={lastDispatchTarget === v.baseRoute[1] ? "0.6" : "0.2"}
            fill="none"
            strokeDasharray="0.5 0.5"
            className="transition-all duration-500"
          />
        ))}
      </svg>



      {/* Nodes Map - T145: Layout hardened for mobile aspect ratios */}
      <div className="relative w-full h-full max-w-[1200px] mx-auto overflow-hidden pb-20 md:pb-0">


        {NODES.map(node => (
          <div
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            className={`absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300
              ${selectedNode === node.id ? 'scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] z-50' : 'hover:scale-105'}
              ${lastDispatchTarget === node.id ? 'animate-ping brightness-150' : ''}`}

            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {/* Peeps Crowd (Density-based) */}
            {/* Peeps Crowd (Density-based) - T136: Guaranteed hitbox transparency */}
            <div className="relative mb-2 w-32 h-16 pointer-events-none select-none flex flex-wrap-reverse justify-center content-start gap-[1px]">
               {Array.from({ length: Math.min(queues[node.id], 100) }).map((_, i) => (
                 <div 
                   key={i} 
                   className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${queues[node.id] > 50 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : queues[node.id] > 25 ? 'bg-yellow-400' : 'bg-blue-400/40'}`} 
                   style={{ 
                     opacity: 1 - (i * 0.005),
                     transform: `translate(${(Math.random()-0.5)*15}px, ${(Math.random()-0.5)*15}px)` 
                   }}
                 />
               ))}
            </div>


            <NodeVisual label={node.label} type={node.type} isHub={node.isHub} />
            
            {queues[node.id] > 0 && (
              <div className={`absolute -top-4 -right-2 font-mono font-black text-xs px-2 py-1 rounded shadow-lg ${queues[node.id] > 40 ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>
                {queues[node.id]}
              </div>
            )}
          </div>
        ))}

        {/* Vehicles */}
        {vehicles.map(v => (
          <div
            key={v.id}
            className="absolute z-40 transition-all duration-200"
            style={{ 
              left: `${v.position.x}%`, 
              top: `${v.position.y}%`,
              scale: lastDispatchTarget === v.baseRoute[1] ? 1.5 : 1,
              transform: `translate(-50%, -50%) rotate(${v.direction === -1 ? 180 : 0}deg)`,
              transition: 'scale 0.5s ease-out, left 0.2s linear, top 0.2s linear'
            }}

          >
            {v.type === 'van' ? <VanIcon passengers={v.passengers} /> : <KombiIcon passengers={v.passengers} />}
          </div>
        ))}
      </div>
    </div>
  );
};

