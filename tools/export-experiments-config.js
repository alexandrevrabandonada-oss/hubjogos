/**
 * Exportar configuração de experimentos em formato estruturado
 * Evita parsing via regex em scripts
 * 
 * Uso: npm run export:experiments-config
 */

const fs = require('fs');
const path = require('path');

// Dynamically require o registry TypeScript compilado
function loadExperimentsConfig() {
  try {
    // Esta função seria melhor com import dinâmico, mas para compatibilidade
    // vamos fazer parsing mais robusto do TypeScript
    const registryPath = path.join(__dirname, '..', 'lib', 'experiments', 'registry.ts');
    const content = fs.readFileSync(registryPath, 'utf-8');

    // Parsing mais seguro: extrair o objeto JSON-like
    const experiments = {};

    // Padrão para encontrar blocos de experimentos
    const blockRegex = /'([^']+)':\s*\{([^}]*?(?:\{[^}]*\}[^}]*?)*)\}/g;
    let match;

    while ((match = blockRegex.exec(content)) !== null) {
      const [fullBlock, key, content] = match;

      // Extrair propriedades usando regex mais simples
      const nameMatch = content.match(/name:\s*'([^']+)'/);
      const descriptionMatch = content.match(/description:\s*'([^']+)'/);
      const enabledMatch = content.match(/enabled:\s*(true|false)/);

      if (nameMatch && enabledMatch) {
        // Extrair variantes
        const variantRegex = /\{\s*key:\s*'([^']+)'[^}]*weight:\s*(\d+)[^}]*name:\s*'([^']+)'/g;
        const variants = [];
        let varMatch;

        while ((varMatch = variantRegex.exec(content)) !== null) {
          const [, varKey, weight, varName] = varMatch;
          variants.push({
            key: varKey,
            weight: parseInt(weight, 10),
            name: varName,
          });
        }

        experiments[key] = {
          key,
          name: nameMatch[1],
          description: descriptionMatch ? descriptionMatch[1] : '',
          enabled: enabledMatch[1] === 'true',
          variants,
        };
      }
    }

    return experiments;
  } catch (err) {
    console.error('❌ Erro carregando experimentos:', err.message);
    return {};
  }
}

function main() {
  const experiments = loadExperimentsConfig();

  // Aplicar overrides
  const overrideStr = process.env.EXPERIMENTS_OVERRIDE || process.env.NEXT_PUBLIC_EXPERIMENTS_OVERRIDE;
  const overrides = {};
  if (overrideStr) {
    overrideStr.split(',').forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && (value === 'true' || value === 'false')) {
        overrides[key] = value === 'true';
      }
    });
  }

  // Aplicar overrides ao config
  Object.keys(experiments).forEach(key => {
    if (key in overrides) {
      experiments[key].enabled = overrides[key];
      experiments[key].overridden = true;
    }
  });

  const output = {
    generated_at: new Date().toISOString(),
    config: {
      base_registry: Object.values(experiments),
      overrides,
      active: Object.values(experiments).filter(e => e.enabled),
      inactive: Object.values(experiments).filter(e => !e.enabled),
    },
  };

  // Salvar em reports/
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `experiments-config-${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}.json`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2));

  console.log(`✅ Configuração de experimentos exportada para: ${filename}`);
  console.log(`   - ${output.config.active.length} ativo(s)`);
  console.log(`   - ${output.config.inactive.length} inativo(s)`);
  if (Object.keys(overrides).length > 0) {
    console.log(`   - ${Object.keys(overrides).length} override(s) aplicado(s)`);
  }
}

main();
