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

// Visual Components
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

const NodeVisual = ({ type, isHub, label }: { type?: string; isHub?: boolean; label: string }) => {
  if (isHub) return (
    <div className="relative flex flex-col items-center">
      <svg width="80" height="64" viewBox="0 0 100 80">
        <rect x="10" y="40" width="80" height="35" rx="4" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
        <rect x="20" y="20" width="60" height="25" rx="2" fill="#2563EB" />
        <path d="M10 40 L50 10 L90 40 Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
      </svg>
      <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5 bg-blue-900/80 px-2 py-0.5 rounded shadow-sm">{label}</span>
    </div>
  );
  if (type === 'upa') return (
    <div className="relative flex flex-col items-center">
      <svg width="50" height="42" viewBox="0 0 60 50">
        <rect x="5" y="15" width="50" height="30" rx="2" fill="#4B5563" stroke="#9CA3AF" strokeWidth="2" />
        <rect x="25" y="10" width="10" height="15" fill="#EF4444" />
        <rect x="20" y="25" width="20" height="10" fill="white" opacity="0.3" />
      </svg>
      <span className="text-[8px] font-bold uppercase mt-0.5 bg-gray-800/80 px-1 rounded">{label}</span>
    </div>
  );
  return (
    <div className="relative flex flex-col items-center">
      <svg width="42" height="34" viewBox="0 0 50 40">
        <rect x="15" y="25" width="20" height="10" rx="1" fill="#374151" />
        <path d="M10 25 L40 25 L50 20 L0 20 Z" fill="#6B7280" />
        <rect x="22" y="10" width="6" height="15" fill="#9CA3AF" />
      </svg>
      <span className="text-[8px] font-medium uppercase mt-0.5 text-gray-300">{label}</span>
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
  const [fleetPool, setFleetPool] = useState(24);
  const [dispatchCooldown, setDispatchCooldown] = useState(0);
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [lastDispatchTarget, setLastDispatchTarget] = useState<NodeId | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'failed'>('playing');
  const [segmentHeat, setSegmentHeat] = useState<Record<string, number>>({});
  const [time, setTime] = useState(6 * 60);

  const tickCounterRef = useRef(0);
  const queuesRef = useRef(queues);
  useEffect(() => { queuesRef.current = queues; }, [queues]);

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
      tickCounterRef.current += 1;
      if (tickCounterRef.current % 2 === 0) {
        setTime(t => {
          const nextTime = t + 1;
          if (nextTime === 6 * 60 + 5) {
            setQueues(q => ({ ...q, lote_xv: q.lote_xv + 16, heliopolis: q.heliopolis + 14, bom_pastor: q.bom_pastor + 12 }));
          }
          if (nextTime === 8 * 60) {
            setQueues(q => ({ ...q, lote_xv: q.lote_xv + 6, upa: q.upa + 8 }));
          }
          if (nextTime >= 10 * 60) {
            telemetryRef.current.sessionDurationSeconds = Math.round((Date.now() - telemetryRef.current.startedAt) / 1000);
            const total = Object.values(queuesRef.current).reduce((a, b) => a + b, 0);
            if (total < 50) setGameState('won');
            else setGameState('failed');
          }
          return nextTime;
        });
      }

      if (Math.random() < 0.04) {
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
            const speedMult = 1.0 / (1 + Math.max(0, counts[segId] - 1) * 0.15);
            const speed = (v.type === 'kombi' ? 2.2 : 1.5) * speedMult;

            if (dist < speed) {
              next.position = { x: targetWp.x, y: targetWp.y };
              const isLast = v.waypointIndex === (v.direction === 1 ? v.pathWaypoints.length - 1 : 0);
              if (isLast) {
                next.state = v.direction === 1 ? 'boarding' : 'unboarding';
                next.timer = v.direction === 1 ? 6 : 4;
              } else {
                next.waypointIndex += v.direction;
              }
            } else {
              next.position.x += (dx / dist) * speed;
              next.position.y += (dy / dist) * speed;
            }
          } else if (v.state === 'boarding' || v.state === 'unboarding') {
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
                setFleetPool(fp => fp + 1);
                return null;
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
        telemetryRef.current.totalDispatches++;
        if (telemetryRef.current.firstDispatchOffsetSeconds === null) {
          telemetryRef.current.firstDispatchOffsetSeconds = Math.round((Date.now() - telemetryRef.current.startedAt) / 1000);
        }
        if (fleetPool === 1) {
          telemetryRef.current.drainEvents++;
          if (time >= 8 * 60 && time < 9 * 60) telemetryRef.current.drainDuring0800Band = true;
        }
        setDispatchCooldown(2);
        setLastDispatchTarget(id);
        setTimeout(() => { setLastDispatchTarget(null); setSelectedNode(null); }, 500);
      }
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0F172A', overflow: 'hidden', userSelect: 'none', fontFamily: 'sans-serif' }}>

      {/* ── BELFORD ROXO BACKGROUND CITYSCAPE ── */}
      <svg
        viewBox="0 0 1000 560"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050c1a" />
            <stop offset="50%" stopColor="#0a1428" />
            <stop offset="80%" stopColor="#1a1230" />
            <stop offset="92%" stopColor="#2a1508" />
            <stop offset="100%" stopColor="#3d1e04" />
          </linearGradient>
          <radialGradient id="sunriseGlow" cx="72%" cy="100%" r="55%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="35%" stopColor="#ea580c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#050c1a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1520" />
            <stop offset="100%" stopColor="#080e17" />
          </linearGradient>
          <filter id="bgBlur"><feGaussianBlur stdDeviation="1.5" /></filter>
          <filter id="bgBlurHeavy"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>

        {/* Sky */}
        <rect width="1000" height="560" fill="url(#bgSky)" />
        <rect width="1000" height="560" fill="url(#sunriseGlow)" />

        {/* Stars (early morning, some still visible) */}
        {[
          [48,38],[115,22],[203,55],[298,18],[392,42],[488,28],[573,15],[641,48],[718,32],
          [832,20],[921,45],[965,28],[75,85],[162,72],[345,65],[530,80],[770,68],[880,78],
          [22,62],[440,10],[680,55],[810,38]
        ].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r={i%3===0?1.1:0.7} fill="white" opacity={0.35+Math.sin(i)*0.15} />
        ))}

        {/* Far mountains — Serra do Mar silhouette */}
        <path
          d="M0,320 Q60,258 130,272 Q195,258 260,228 Q320,205 385,218 Q445,232 510,205 Q568,178 630,192 Q695,208 755,178 Q815,152 875,168 Q930,182 985,172 L1000,172 L1000,560 L0,560 Z"
          fill="#0c1725" opacity="0.95"
        />
        {/* Closer hills */}
        <path
          d="M0,345 Q80,308 165,318 Q240,328 315,305 Q380,288 450,308 Q512,328 580,308 Q645,288 710,305 Q775,322 845,308 Q905,295 965,312 L1000,318 L1000,560 L0,560 Z"
          fill="#0f1d2c" opacity="0.98"
        />

        {/* Distant building layer (blurred, behind main cityscape) */}
        <g filter="url(#bgBlur)" opacity="0.6">
          {[
            [10,298,16,72],[28,310,12,60],[46,290,20,80],[68,305,14,65],[84,295,18,75],
            [104,308,10,62],[116,292,22,78],[140,300,16,70],[160,285,24,95],[187,295,18,75],
            [208,282,26,98],[238,292,20,88],[262,298,14,72],[278,285,28,95],[310,275,22,105],
            [335,288,16,82],[354,278,20,92],[378,290,18,80],[399,272,30,108],[432,280,22,100],
            [457,268,26,112],[486,278,20,102],[509,274,24,96],[536,282,18,88],[558,268,28,112],
            [590,275,22,105],[615,265,30,115],[648,272,26,108],[676,260,32,120],[712,270,24,110],
            [740,278,20,102],[763,272,26,108],[790,268,22,112],[815,280,18,100],[836,274,24,106],
            [862,270,20,110],[884,278,16,102],[904,268,24,112],[930,275,18,105],[952,270,22,110],
            [976,280,16,100]
          ].map(([x,y,w,h],i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="#111d2e" />
          ))}
        </g>

        {/* MAIN BUILDING LAYER — Belford Roxo urban fabric */}

        {/* Cluster 1: Left side (Lote XV area) */}
        <rect x="0" y="290" width="22" height="110" fill="#14202e" />
        <rect x="24" y="278" width="28" height="122" fill="#16232f" />
        {/* Water tank */}
        <rect x="30" y="270" width="16" height="8" fill="#192840" />
        <rect x="34" y="262" width="8" height="8" fill="#192840" />
        <rect x="54" y="285" width="24" height="115" fill="#14202e" />
        <rect x="80" y="295" width="18" height="105" fill="#16232f" />
        <rect x="100" y="282" width="26" height="118" fill="#14202e" />
        <rect x="105" y="274" width="16" height="8" fill="#192840" />
        <rect x="108" y="266" width="10" height="8" fill="#192840" />
        <rect x="128" y="292" width="20" height="108" fill="#16232f" />

        {/* Church tower — left-center */}
        <rect x="155" y="240" width="32" height="160" fill="#13202e" />
        <polygon points="171,210 155,245 187,245" fill="#13202e" />
        <rect x="167" y="200" width="8" height="15" fill="#13202e" />
        {/* Cross */}
        <rect x="169" y="196" width="4" height="20" fill="#1a2d40" />
        <rect x="164" y="202" width="14" height="3" fill="#1a2d40" />
        {/* Church window */}
        <rect x="166" y="255" width="10" height="14" rx="5" fill="#f0a020" opacity="0.5" />

        {/* Cluster 2: Center-left */}
        <rect x="192" y="275" width="22" height="125" fill="#14202e" />
        <rect x="216" y="265" width="30" height="135" fill="#172330" />
        <rect x="224" y="255" width="14" height="10" fill="#1c2d42" />
        <rect x="228" y="247" width="6" height="8" fill="#1c2d42" />
        <rect x="248" y="272" width="24" height="128" fill="#14202e" />
        <rect x="274" y="268" width="28" height="132" fill="#172330" />
        <rect x="280" y="260" width="16" height="8" fill="#1c2d42" />
        <rect x="305" y="278" width="20" height="122" fill="#14202e" />
        <rect x="327" y="270" width="26" height="130" fill="#172330" />

        {/* Cluster 3: Center (Heliópolis area) */}
        <rect x="356" y="260" width="30" height="140" fill="#14202e" />
        <rect x="364" y="252" width="14" height="8" fill="#192840" />
        <rect x="388" y="268" width="24" height="132" fill="#172330" />
        <rect x="414" y="255" width="32" height="145" fill="#14202e" />
        <rect x="423" y="245" width="14" height="10" fill="#192840" />
        <rect x="427" y="237" width="6" height="8" fill="#192840" />
        <rect x="448" y="265" width="26" height="135" fill="#172330" />
        <rect x="476" y="258" width="28" height="142" fill="#14202e" />

        {/* Cluster 4: Center-right (Bom Pastor area) */}
        <rect x="507" y="262" width="24" height="138" fill="#172330" />
        <rect x="534" y="255" width="30" height="145" fill="#14202e" />
        <rect x="542" y="245" width="14" height="10" fill="#192840" />
        <rect x="566" y="265" width="22" height="135" fill="#172330" />
        <rect x="590" y="258" width="28" height="142" fill="#14202e" />
        <rect x="598" y="248" width="12" height="10" fill="#192840" />
        <rect x="601" y="240" width="6" height="8" fill="#192840" />
        <rect x="621" y="268" width="24" height="132" fill="#172330" />
        <rect x="647" y="260" width="26" height="140" fill="#14202e" />

        {/* Cluster 5: Right side (UPA / Bom Pastor) */}
        <rect x="676" y="255" width="32" height="145" fill="#172330" />
        <rect x="684" y="245" width="16" height="10" fill="#192840" />
        <rect x="688" y="237" width="8" height="8" fill="#192840" />
        <rect x="710" y="262" width="24" height="138" fill="#14202e" />
        <rect x="736" y="268" width="26" height="132" fill="#172330" />
        <rect x="764" y="258" width="22" height="142" fill="#14202e" />
        <rect x="772" y="248" width="6" height="10" fill="#192840" />
        <rect x="788" y="265" width="28" height="135" fill="#172330" />
        <rect x="819" y="272" width="20" height="128" fill="#14202e" />
        <rect x="841" y="260" width="26" height="140" fill="#172330" />
        <rect x="869" y="268" width="22" height="132" fill="#14202e" />
        <rect x="893" y="262" width="28" height="138" fill="#172330" />
        <rect x="923" y="270" width="24" height="130" fill="#14202e" />
        <rect x="949" y="265" width="20" height="135" fill="#172330" />
        <rect x="971" y="272" width="29" height="128" fill="#14202e" />

        {/* Lit windows — warm yellow dots in buildings */}
        {[
          // Building x, y
          [26,295],[26,315],[26,335],[42,305],[42,325],
          [56,298],[56,318],[56,338],
          [102,290],[102,310],[118,300],[118,320],
          [168,258], // church
          [194,285],[194,305],[220,278],[220,298],[220,318],
          [249,285],[249,305],[277,280],[277,300],
          [357,270],[357,290],[357,310],[393,278],[393,298],
          [416,265],[416,285],[416,305],[450,275],[450,295],
          [478,270],[478,290],[478,310],
          [509,272],[509,292],[537,268],[537,288],[537,308],
          [568,275],[568,295],[592,265],[592,285],[592,305],
          [623,278],[623,298],[649,272],[649,292],
          [678,268],[678,288],[678,308],[713,275],[713,295],
          [738,278],[738,298],[766,265],[766,285],
          [791,278],[791,298],[842,272],[842,292],[842,312],
          [871,280],[895,270],[895,290],[926,282],[926,302],
        ].map(([x,y],i) => (
          <rect key={i} x={x} y={y} width={4} height={3} fill="#fbbf24" opacity={0.45+Math.sin(i*1.7)*0.2} />
        ))}

        {/* Occasional blue-white window (fluorescent light) */}
        {[[58,342],[225,338],[420,325],[539,328],[680,328],[768,305],[897,310]].map(([x,y],i) => (
          <rect key={i} x={x} y={y} width={5} height={3} fill="#bae6fd" opacity={0.35} />
        ))}

        {/* Power line poles — iconic Baixada Fluminense */}
        {[110, 310, 510, 710, 910].map((px, i) => (
          <g key={i}>
            <line x1={px} y1="400" x2={px} y2="268" stroke="#0e1c2c" strokeWidth="3" />
            <line x1={px-22} y1="278" x2={px+22} y2="278" stroke="#0e1c2c" strokeWidth="2.5" />
            <line x1={px-18} y1="289" x2={px+18} y2="289" stroke="#0e1c2c" strokeWidth="2" />
            {/* Insulators */}
            <circle cx={px-22} cy="278" r="2" fill="#0f2035" />
            <circle cx={px+22} cy="278" r="2" fill="#0f2035" />
          </g>
        ))}
        {/* Power cables between poles */}
        {[[110,278,310,280],[110,289,310,291],[310,280,510,278],[310,291,510,289],
          [510,278,710,282],[510,289,710,293],[710,282,910,280],[710,293,910,291]
        ].map(([x1,y1,x2,y2],i) => (
          <path key={i} d={`M${x1},${y1} Q${(x1+x2)/2},${(y1+y2)/2+8} ${x2},${y2}`}
            stroke="#0b1928" strokeWidth="1.2" fill="none" opacity="0.8" />
        ))}

        {/* SuperVia rail line — runs across the lower third */}
        <rect x="0" y="390" width="1000" height="8" fill="#0c1928" />
        <rect x="0" y="393" width="1000" height="2" fill="#0a1520" />
        {/* Rail sleepers */}
        {Array.from({length:52}).map((_,i) => (
          <rect key={i} x={i*20} y="390" width="10" height="8" fill="#0b1826" />
        ))}
        {/* Platform hint at center (Hub Belford Roxo) */}
        <rect x="420" y="386" width="160" height="5" fill="#132035" />
        <rect x="440" y="382" width="120" height="4" rx="1" fill="#1a2d42" />

        {/* Ground / street level */}
        <rect x="0" y="398" width="1000" height="162" fill="url(#groundGrad)" />

        {/* Street texture — horizontal lines suggesting asphalt */}
        <rect x="0" y="400" width="1000" height="1" fill="#0a1018" opacity="0.6" />
        <rect x="0" y="415" width="1000" height="1" fill="#0a1018" opacity="0.3" />

        {/* Atmospheric ground haze */}
        <rect x="0" y="360" width="1000" height="60" fill="#1a2535" opacity="0.15" filter="url(#bgBlurHeavy)" />

        {/* Horizon glow bleed */}
        <rect x="0" y="340" width="1000" height="60" fill="#c2410c" opacity="0.04" filter="url(#bgBlurHeavy)" />
      </svg>

      {/* ── GAME CANVAS: single absolute container for ALL game elements ── */}
      <div style={{ position: 'absolute', inset: 0 }}>

        {/* Road Network SVG — stretched to fill parent */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}
        >
          <path d="M 50,85 L 50,65 L 15,65 L 15,15" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
          <path d="M 50,65 L 50,40" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
          <path d="M 50,65 L 85,45 L 85,25" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />
          <path d="M 85,45 L 85,65" stroke="white" strokeWidth="0.5" fill="none" strokeLinejoin="round" opacity="0.3" />

          {/* Congestion heat */}
          {Object.entries(segmentHeat).map(([segId, count]) => {
            if ((count as number) < 2) return null;
            const [wpIdxStr, dirStr, targetId] = segId.split('-');
            const wpIdx = parseInt(wpIdxStr);
            const dir = parseInt(dirStr);
            const v = vehicles.find(veh => veh.baseRoute[1] === targetId && veh.direction === dir);
            if (!v || !v.pathWaypoints) return null;
            const startWp = v.pathWaypoints[wpIdx - (dir === 1 ? 1 : 0)];
            const endWp = v.pathWaypoints[wpIdx + (dir === -1 ? 1 : 0)];
            if (!startWp || !endWp) return null;
            return (
              <path key={`heat-${segId}`}
                d={`M ${startWp.x},${startWp.y} L ${endWp.x},${endWp.y}`}
                stroke={(count as number) >= 4 ? '#EF4444' : '#F59E0B'}
                strokeWidth="2" strokeLinecap="round" opacity={0.8} />
            );
          })}

          {/* Active route dotted lines */}
          {vehicles.map(v => (
            <path key={`path-${v.id}`}
              d={`M ${v.pathWaypoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
              stroke={lastDispatchTarget === v.baseRoute[1] ? '#60A5FA' : '#3B82F6'}
              strokeWidth={lastDispatchTarget === v.baseRoute[1] ? "0.6" : "0.2"}
              fill="none" strokeDasharray="0.5 0.5" />
          ))}
        </svg>

        {/* Nodes — positioned with % matching SVG coordinate space */}
        {NODES.map(node => (
          <div
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s, filter 0.2s',
              filter: selectedNode === node.id ? 'drop-shadow(0 0 12px rgba(59,130,246,0.9))' : 'none',
            }}
          >
            {/* Queue crowd dots */}
            <div style={{ width: 72, height: 36, marginBottom: 4, pointerEvents: 'none', display: 'flex', flexWrap: 'wrap-reverse', justifyContent: 'center', alignContent: 'flex-start', gap: 1 }}>
              {Array.from({ length: Math.min(queues[node.id], 54) }).map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: queues[node.id] > 50 ? '#EF4444' : queues[node.id] > 25 ? '#FBBF24' : '#60A5FA',
                  opacity: 1 - i * 0.01,
                }} />
              ))}
            </div>

            <NodeVisual label={node.label} type={node.type} isHub={node.isHub} />

            {queues[node.id] > 0 && (
              <div style={{
                position: 'absolute', top: -8, right: -4,
                background: queues[node.id] > 40 ? '#DC2626' : 'white',
                color: queues[node.id] > 40 ? 'white' : 'black',
                fontFamily: 'monospace', fontWeight: 900, fontSize: 11,
                padding: '1px 6px', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}>
                {queues[node.id]}
              </div>
            )}
          </div>
        ))}

        {/* Vehicles */}
        {vehicles.map(v => (
          <div key={v.id} style={{
            position: 'absolute',
            left: `${v.position.x}%`,
            top: `${v.position.y}%`,
            transform: `translate(-50%, -50%) rotate(${v.direction === -1 ? 180 : 0}deg)`,
            zIndex: 40,
            transition: 'left 0.2s linear, top 0.2s linear',
          }}>
            {v.type === 'van' ? <VanIcon passengers={v.passengers} /> : <KombiIcon passengers={v.passengers} />}
          </div>
        ))}
      </div>

      {/* ── RESULT OVERLAY ── */}
      {gameState !== 'playing' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1E293B', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16, color: gameState === 'won' ? '#4ADE80' : '#EF4444' }}>
              {gameState === 'won' ? 'Fluxo Estabilizado' : 'Sistema em Colapso'}
            </h2>
            <p style={{ color: '#9CA3AF', marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
              {gameState === 'won'
                ? 'Você conseguiu conter o surto da manhã. A população chegou ao trabalho sem grandes atrasos.'
                : 'As filas superaram a capacidade da frota popular. Belford Roxo parou hoje.'}
            </p>
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: 2 }}>Dados da sessão</div>
              <div>Despachos: <span style={{ color: 'white' }}>{telemetryRef.current.totalDispatches}</span></div>
              <div>Drenos de frota: <span style={{ color: telemetryRef.current.drainEvents > 0 ? '#F87171' : '#4ADE80' }}>{telemetryRef.current.drainEvents}</span></div>
              <div>1º despacho: <span style={{ color: 'white' }}>{telemetryRef.current.firstDispatchOffsetSeconds !== null ? `${telemetryRef.current.firstDispatchOffsetSeconds}s` : '—'}</span></div>
              <div>Duração: <span style={{ color: 'white' }}>{telemetryRef.current.sessionDurationSeconds}s</span></div>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{ width: '100%', background: '#2563EB', color: 'white', fontWeight: 900, padding: '16px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 2, fontSize: 14 }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* ── HUD: compact floating panel, top-left ── */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 80, maxWidth: 'min(90vw, 260px)', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(13,27,46,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '12px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', pointerEvents: 'auto' }}>

          {/* Title + clock */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>Frota Popular</div>
              <div style={{ fontSize: 8, color: 'rgba(147,197,253,0.5)', textTransform: 'uppercase', fontWeight: 700, marginTop: 3 }}>Clique nos bairros!</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 900, color: 'white', lineHeight: 1 }}>{formatTime(time)}</div>
              <div style={{ fontSize: 7, fontWeight: 700, padding: '2px 4px', borderRadius: 3, marginTop: 3, textAlign: 'center', background: time < 8 * 60 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: time < 8 * 60 ? '#4ADE80' : '#F87171' }}>
                {time < 9 * 60 ? 'RUSH MANHÃ' : 'HORA CRÍTICA'}
              </div>
            </div>
          </div>

          {/* Fleet indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 8, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Frota</span>
            <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: fleetPool === 0 ? '#EF4444' : '#60A5FA' }}>{fleetPool}</span>
            <div style={{ display: 'flex', gap: 2, flex: 1 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < Math.ceil(fleetPool / 2) ? '#3B82F6' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>

          {/* Dispatch cooldown bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
            <div style={{ height: '100%', background: '#3B82F6', width: `${(1 - dispatchCooldown / 12) * 100}%`, transition: 'width 0.2s' }} />
          </div>

        </div>
      </div>

    </div>
  );
};
