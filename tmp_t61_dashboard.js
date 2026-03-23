const fs = require('fs');
const pgPath = 'c:/Projetos/Hub Jogos Pré Camp/app/estado/page.tsx';
let pgContent = fs.readFileSync(pgPath, 'utf8');

const regex = /<Card className=\{styles\.fullCard\}>\s*<h3>Insights Bairro Resiste \(T58\/T59\)<\/h3>[\s\S]*?<\/Card>/;

const newCard = `<Card className={styles.fullCard}>
          <h3>Insights & Validação Pós-Premium: Bairro Resiste (T61)</h3>
          
          <div className="bg-slate-900 border border-slate-700 rounded p-4 mb-6">
            <h4 className="text-sm uppercase tracking-widest text-slate-400 mb-2">Veredito Editorial</h4>
            <div className="flex items-center space-x-4">
               {bairroRunCount >= 30 ? (
                 <span className="px-3 py-1 bg-green-900 text-green-300 font-bold rounded-full text-xs">FEATURED_CONFIRMED</span>
               ) : (
                 <span className="px-3 py-1 bg-yellow-900 text-yellow-300 font-bold rounded-full text-xs">LIVE_BUT_EARLY (Amostra Fria)</span>
               )}
               <span className="text-sm text-slate-300">
                 {bairroRunCount >= 30 ? 'Desempenho sustentado, retenção superior aos legados.' : 'Faltam dados para destronar Tarifa Zero do hero banner. Mantido apenas como Live.'}
               </span>
            </div>
          </div>

          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Amostra Local</p>
              <p className={styles.signalValue}>{bairroRunCount} <span className="text-xs text-slate-500">/ 30 min</span></p>
              <p className={styles.signalNote}>runs efetivas pós-premium</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Replay Rate</p>
              <p className={styles.signalValue}>{bairroRunCount > 0 ? 'TBD' : '0%'}</p>
              <p className={styles.signalNote}>vs Tarifa Zero (0%)</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Sobrevivência Média</p>
              <p className={styles.signalValue}>Fase {bairroAvgPhase}</p>
              <p className={styles.signalNote}>tempo suportado vs colapso</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ameaça Crítica</p>
              <p className={styles.signalValue}>{String(bairroWorstHotspotMode).toUpperCase()}</p>
              <p className={styles.signalNote}>hotspot dominante no wipe</p>
            </div>
          </div>
        </Card>`;

if (regex.test(pgContent)) {
  pgContent = pgContent.replace(regex, newCard);
  fs.writeFileSync(pgPath, pgContent, 'utf8');
  console.log('T61 Insights injected successfully.');
} else {
  console.log('Regex failed to find T58 card.');
}
