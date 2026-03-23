const fs = require('fs');
const pgPath = 'c:/Projetos/Hub Jogos Pré Camp/app/estado/page.tsx';
let pgContent = fs.readFileSync(pgPath, 'utf8');

const targetStr = `        <Card className={styles.fullCard}>
          <h3>Front-stage da Home e Explorar</h3>`;

const injectJsx = `        <Card className={styles.fullCard}>
          <h3>Insights Bairro Resiste (T58/T59)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Amostra Local</p>
              <p className={styles.signalValue}>{bairroRunCount}</p>
              <p className={styles.signalNote}>runs finalizadas</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Maior Ameaça</p>
              <p className={styles.signalValue}>{bairroWorstHotspotMode.toString().toUpperCase()}</p>
              <p className={styles.signalNote}>hotspot mais colapsado</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Sobrevivência Média</p>
              <p className={styles.signalValue}>Fase {bairroAvgPhase}</p>
              <p className={styles.signalNote}>fase de colapso/vitória</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ação Mais Eficaz</p>
              <p className={styles.signalValue}>{bairroMostUsedActionMode.toString().toUpperCase()}</p>
              <p className={styles.signalNote}>curas efetuadas</p>
            </div>
          </div>
        </Card>

` + targetStr;

if (pgContent.includes(targetStr) && !pgContent.includes('Insights Bairro Resiste')) {
  pgContent = pgContent.replace(targetStr, injectJsx);
  fs.writeFileSync(pgPath, pgContent, 'utf8');
  console.log('Successfully injected Bairro Resiste card.');
} else {
  console.log('Target string not found or already injected.');
}
