const fs = require('fs');

const cssPath = 'c:/Projetos/Hub Jogos Pré Camp/components/games/arcade/BairroResisteArcadeGame.module.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.dangerOverlay')) {
cssContent += `

.dangerOverlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 120px rgba(220, 38, 38, 0.5);
  animation: pulseDanger 1.2s infinite alternate;
  z-index: 10;
}
@keyframes pulseDanger {
  from { opacity: 0.3; }
  to { opacity: 0.8; }
}

.healingEffect {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.9);
  animation: healPulse 0.5s ease-out forwards;
  pointer-events: none;
  z-index: 5;
}
@keyframes healPulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Smooth transition for progress bar */
.smoothBar {
  transition: width 0.3s ease-out, background-color 0.3s ease;
}
`;
fs.writeFileSync(cssPath, cssContent, 'utf8');
}

const tsxPath = 'c:/Projetos/Hub Jogos Pré Camp/components/games/arcade/BairroResisteArcadeGame.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf8');

// Tuning reductions
tsxContent = tsxContent.replace(/pressureIncrease = 3 \+ Math\.random\(\) \* 7; \/\/ 3 a 10 por seg/, 'pressureIncrease = 2 + Math.random() * 4; // 2 a 6 por seg');
tsxContent = tsxContent.replace(/pressureIncrease \+= 20; \/\/ burst de 20 de pressão súbita/, 'pressureIncrease += 15; // burst de 15 de pressão súbita');
tsxContent = tsxContent.replace(/const damage = activeCriticalCount \* 4; \/\/ 4% por hotspot crítico/g, 'const damage = activeCriticalCount * 2; // 2% por hotspot crítico');
tsxContent = tsxContent.replace(/cooldownMs: 2000 \/\/ 2 segundos de cooldown/g, 'cooldownMs: 1500 // 1.5s de cooldown');

// Add danger overlay
tsxContent = tsxContent.replace(
  /<div className=\{styles\.mapBackground\}>/,
  `<div className={styles.mapBackground}>\n            {integrity <= 30 && <div className={styles.dangerOverlay} />}`
);

// Add smooth bar
tsxContent = tsxContent.replace(
  /className=\{\`h-full \$\{state === 'critical' \? 'bg-red-500' : state === 'warning' \? 'bg-yellow-500' : 'bg-blue-500'\}\`\}/,
  `className={\`h-full \${styles.smoothBar} \${state === 'critical' ? 'bg-red-500' : state === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}\`}`
);

// Add healing visual effect during early cooldown
tsxContent = tsxContent.replace(
  /\{isOnCooldown && \(\n                    <div className="absolute inset-0 rounded-full border-4 border-slate-400 border-t-white animate-spin" \/>\n                  \)\}/,
  `{isOnCooldown && (
                    <div className="absolute inset-0 rounded-full border-4 border-slate-400 border-t-white animate-spin" />
                  )}
                  {h.cooldownMs > 1000 && (
                    <div className={styles.healingEffect} />
                  )}`
);

fs.writeFileSync(tsxPath, tsxContent, 'utf8');
console.log('Tuning and visual feedback applied');
