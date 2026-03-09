# Pipeline de Assets do Hub (T44-T47)

## Objetivo

Padronizar ingestao, organizacao e integracao de assets para todo jogo do hub, separando claramente:
- VS Code/Codex: estrutura, manifest, loader, fallback e runtime.
- pipeline externo: producao visual/audio fora do VS Code e entrega nas pastas corretas.

**T45 Adição**: Integração completa da `cooperativa-na-pressao` ao manifest/loader + auditoria automática para reduzir erro humano.

## Estrutura global obrigatoria

Cada jogo deve ter um Asset Pack em:

`public/<line>/<slug>/`

Estrutura minima:

```
public/<line>/<slug>/
├── bg/
├── player/
├── entities/
├── pickups/
├── obstacles/
├── ui/
├── fx/
├── audio/
├── manifest.json
└── README.md
```

## Convencao de nomes

Formato obrigatorio:

`<categoria>-<nome>-v<versao>.<ext>`

Exemplos:
- `bg-bairro-base-v1.svg`
- `entity-hotspot-agua-v1.svg`
- `ui-hud-pressure-v2.svg`
- `sfx-alerta-pressao-v1.ogg`

Regras:
- minusculas
- hifen como separador
- sem espacos
- versao explicita

## Manifest por jogo

Arquivo: `public/<line>/<slug>/manifest.json`

Campos padrao:
- `game`: slug, line, packSlug, title
- `version`: manifestVersion, visualVersion, assetSet
- `assets`: mapa de chave para caminho publico
- `fallback`: default e opcional por chave
- `metadata`: flags simples (`externalPipeline`, `runtimeFallback`, `mobileSafe`, `updatedAt`)

## Loader reutilizavel

Implementacao base:
- `lib/games/assets/asset-pack-loader.ts`

Responsabilidades:
- resolver path pelo manifest (`resolveAssetPath`)
- expor versao visual e asset set (`getAssetPackVersion`)
- carregar/cachear imagem com seguranca no DOM
- desenhar asset com fallback (`drawAssetFromManifest`)
- resumir estado de carga (`getAssetLoadSummary`)

## Separacao de responsabilidade

### Codex / VS Code

- define estrutura de pastas
- define e valida manifest
- integra loader no runtime
- garante fallback seguro
- cria testes de smoke
- nao gera arte final

### Producao externa

- produz SVG/PNG/audio
- entrega arquivos nomeados no padrao
- versiona incrementos de asset
- atualiza inventario no README local

## Fallback e resiliencia

Regra obrigatoria:
- ausencia de asset nunca pode quebrar gameplay.

Pratica:
- runtime continua com render canvas quando arquivo faltar.
- fallback por chave e fallback default no manifest.
- logica de jogo nunca depende de `image.complete` para continuar tick.

## Smoke visual padrao

### Script unico

`npm run test:assets-smoke`

Executa:
- `tests/unit/asset-pack-loader.test.ts` (4 tests)
- `tests/e2e/assets-pipeline-smoke.spec.ts` (9 tests)

### Cobertura minima

- assets carregam em desktop
- assets carregam em mobile
- fallback de path funciona
- layout nao quebra
- sem page errors
- **T45 adição**: manifest metadata (visualVersion, assetSet) validado na tela

## Jogos validados no T44-T45

- `tarifa-zero-corredor` (T44)
  - manifest criado e integrado no loader de runtime
  - estrutura padrao completada com placeholders (`entities`, `fx`, `audio`)
  - smoke test validado (desktop + mobile)

- `mutirao-do-bairro` (T44)
  - manifest criado e integrado no runtime
  - estrutura padrao completada com placeholders (`pickups`, `obstacles`, `fx`, `audio`)
  - smoke test validado (desktop + mobile)

- `cooperativa-na-pressao` (T44 → T45 INTEGRAÇÃO COMPLETA)
  - manifest criado e estrutura padrao com P0 (T44)
  - **T45**: runtime agora consumindo manifest completamente
  - **T45**: componente exporta COOPERATIVA_VISUAL_VERSION e COOPERATIVA_ASSET_SET
  - **T45**: smoke test adicionado e validado (desktop + mobile)
  - proximos assets (P1/P2) devem seguir o padrão

## Checklist operacional por novo jogo

- [ ] criar estrutura padrao em `public/<line>/<slug>/`
- [ ] criar `manifest.json`
- [ ] criar `README.md` local com inventario P0/P1/P2
- [ ] integrar loader no runtime
- [ ] validar fallback canvas-first
- [ ] executar `npm run test:assets-smoke`
- [ ] executar gates globais (`lint`, `type-check`, `test:unit`, `build`, `verify`)

## Auditoria automática de assets (T45)

### Script

`npm run assets:audit`

### Validações

A auditoria verifica:
- [ ] manifest.json existe e eh valido
- [ ] cada asset no manifest existe em disco
- [ ] caminhos de fallback apontam para arquivos reais
- [ ] nao ha arquivos orfaos relevantes (fora de fx/ ou audio/)
- [ ] campos obrigatorios do manifest presentes
- [ ] sem nomes duplicados ou conflitos

### Severidades

- **ok**: todos os assets presentes, sem orfaos
- **warning**: arquivos orfaos detectados ou fallback opcional ausente
- **error**: asset obrigatorio faltando ou manifest quebrado

### Output

- Console report com badges de status
- JSON report em `reports/assets/YYYY-MM-DD-HHMM-assets-audit.json`
- Exit code 1 se houver assets faltando (bloqueia deploy)

### Uso antes de merge/deploy

```bash
npm run assets:audit
# Revisar issues antes de mergear
# Corrigir paths ou adicionar arquivos faltando
```

## T46 Updates: Operational Hardening

**Cross-platform path normalization**: Audit agora normaliza paths (Windows \ → Unix /) antes de comparar manifest vs disco, eliminando false positives.

**Allowlist mechanism**: Orfaos conhecidos podem ser documentados em `tools/assets-audit-allowlist.json`:
```json
{
  "allowlist": {
    "game-slug": {
      "filename.svg": "Justification (review YYYY-MM-DD)"
    }
  }
}
```

**Exit code refinado**: 
- Exit code 1 apenas para **errors** (bloqueia CI/deploy)
- Exit code 0 para **ok/warning** (permite deploy, review warnings incrementalmente)

**Documentação completa**:
- Política formal: [politica-de-auditoria-de-assets.md](./politica-de-auditoria-de-assets.md)
- CI/Pre-merge gate: [ci-gate-assets.md](./ci-gate-assets.md)

**Estado atual (T46 completion)**:
```
=== SUMMARY ===
OK:      3
Warning: 0
Error:   0

✓ All asset packs OK – safe to deploy.
```

## T47 Updates: Institutionalizacao

### CI oficial do pipeline

- Workflow dedicado ativo: `.github/workflows/assets-audit.yml`
- Gate oficial: `npm run assets:audit`
- Regra de bloqueio:
  - `error` bloqueia merge/deploy
  - `warning` nao bloqueia, mas fica visivel no job

### Regra de escopo para PRs

O gate roda automaticamente para mudancas em:
- `public/arcade/**`
- `lib/games/assets/**`
- `lib/games/arcade/*assets.ts`
- `tools/assets-audit.js`
- `tools/assets-audit-allowlist.json`

### Fluxo oficial de ingestao

`gerar -> pasta correta -> manifest -> audit -> smoke -> merge`

Checklist detalhado:
- `docs/checklist-oficial-ingestao-assets.md`

### Template oficial de Asset Pack

Modelo reutilizavel em:
- `docs/templates/asset-pack-template/README.md`
- `docs/templates/asset-pack-template/manifest.json`
- `docs/templates/asset-pack-template/README-pack.md`
- `docs/templates/asset-pack-template/STRUCTURE.txt`

### Operacao diaria

- Rodar `npm run assets:audit` para consistencia manifest/disco.
- Rodar `npm run assets:health-report` para resumo executivo.
- Revisar allowlist conforme `tools/assets-audit-allowlist.json` (`review.nextReviewAt`).

## T48 Updates: Blindagem Operacional Final

### Alerta automatico de review da allowlist

Workflow oficial agora calcula estado de revisao com base em `review.nextReviewAt`:
- `ON_TRACK`
- `DUE_SOON` (<=14 dias)
- `OVERDUE`
- `MISSING`

Regra: informativo e visivel em summary/log, sem bloquear merge sozinho.

### Summary curto no GitHub Actions

Cada execucao publica resumo com:
- status geral do gate;
- warnings totais;
- estado/proxima revisao da allowlist;
- packs afetados no diff.

### Smoke seletivo para assets criticos

CI detecta mudancas criticas em runtime (`manifest`, `bg`, `player`, `obstacles`, `pickups`, `ui`, loaders).

Comportamento:
- mudou critico -> roda `npm run test:assets-smoke`;
- nao mudou critico -> pula smoke adicional para evitar ruido.

Politica detalhada:
- `docs/assets-criticos-runtime.md`

### Escopo adiado para T49

- refinamento de lista critica por telemetria real de incidentes;
- eventual segmentacao do smoke por pack afetado (sem fragilizar cobertura).
