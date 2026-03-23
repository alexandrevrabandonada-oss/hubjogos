const fs = require('fs');
const pgPath = 'c:/Projetos/Hub Jogos Pré Camp/app/estado/page.tsx';
let pgContent = fs.readFileSync(pgPath, 'utf8');

const targetStr = '<h3>Front-stage da Home e Explorar</h3>';

// We inject the whole Card block right before targetStr.
// Since targetStr is inside a <Card> block, we actually want to insert the Bairro card BEFORE that <Card> block.
// Let's find the index of targetStr, then backtrack to `<Card`.
const index = pgContent.indexOf(targetStr);
const cardIndex = pgContent.lastIndexOf('<Card', index);

const injectJsx = `
        <Card className={styles.fullCard}>
          <h3>Insights Bairro Resiste (T58/T59)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Amostra Local</p>
              <p className={styles.signalValue}>{bairroRunCount}</p>
              <p className={styles.signalNote}>runs finalizadas</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Maior Ameaça</p>
              <p className={styles.signalValue}>{String(bairroWorstHotspotMode).toUpperCase()}</p>
              <p className={styles.signalNote}>hotspot mais colapsado</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Sobrevivência Média</p>
              <p className={styles.signalValue}>Fase {bairroAvgPhase}</p>
              <p className={styles.signalNote}>fase de colapso/vitória</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ação Mais Eficaz</p>
              <p className={styles.signalValue}>{String(bairroMostUsedActionMode).toUpperCase()}</p>
              <p className={styles.signalNote}>curas efetuadas</p>
            </div>
          </div>
        </Card>\n`;

if (!pgContent.includes('Insights Bairro Resiste')) {
  pgContent = pgContent.substring(0, cardIndex) + injectJsx + pgContent.substring(cardIndex);
  fs.writeFileSync(pgPath, pgContent, 'utf8');
}
