const fs = require('fs');

const tsxPath = 'c:/Projetos/Hub Jogos Pré Camp/components/games/arcade/BairroResisteArcadeGame.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf8');

if (!tsxContent.includes('const [actionStats, setActionStats]')) {
  // Add state
  tsxContent = tsxContent.replace(
    /const \[score, setScore\] = useState\(0\);\n  const \[phaseReached, setPhaseReached\] = useState<number>\(1\);/,
    `const [score, setScore] = useState(0);\n  const [phaseReached, setPhaseReached] = useState<number>(1);\n  const [actionStats, setActionStats] = useState<Record<HotspotType, number>>({ agua: 0, moradia: 0, mobilidade: 0, saude: 0 });`
  );

  // Add to ref
  tsxContent = tsxContent.replace(
    /const stateRef = useRef\(\{ integrity, hotspots, score \}\);\n  stateRef\.current = \{ integrity, hotspots, score \};/,
    `const stateRef = useRef({ integrity, hotspots, score, actionStats });\n  stateRef.current = { integrity, hotspots, score, actionStats };`
  );

  // Reset state on start
  tsxContent = tsxContent.replace(
    /setPhaseReached\(1\);\n    setHotspots\(INITIAL_HOTSPOTS\);/,
    `setPhaseReached(1);\n    setHotspots(INITIAL_HOTSPOTS);\n    setActionStats({ agua: 0, moradia: 0, mobilidade: 0, saude: 0 });`
  );

  // Track click
  tsxContent = tsxContent.replace(
    /if \(h\.cooldownMs > 0\) return; \/\/ bloqueado por cooldown/,
    `if (h.cooldownMs > 0) return; // bloqueado por cooldown\n    \n    setActionStats(prev => ({ ...prev, [h.id]: prev[h.id] + 1 }));`
  );

  // Add to telemetry
  tsxContent = tsxContent.replace(
    /bairro_worst_hotspot: worstHotspot\.id\n    \}\);/,
    `bairro_worst_hotspot: worstHotspot.id,\n      bairro_most_used_action: Object.keys(stateRef.current.actionStats).reduce((a, b) => stateRef.current.actionStats[a as HotspotType] > stateRef.current.actionStats[b as HotspotType] ? a : b)\n    });`
  );

  fs.writeFileSync(tsxPath, tsxContent, 'utf8');
}
