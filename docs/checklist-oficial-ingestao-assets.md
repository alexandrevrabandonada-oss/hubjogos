# Checklist Oficial de Ingestao de Assets

Checklist operacional obrigatorio para entrada de assets externos no hub.

## Fluxo oficial

`gerar -> pasta correta -> manifest -> audit -> smoke -> merge`

## 1. Geracao externa

- [ ] Gerar asset fora do VS Code (pipeline de arte/audio externo).
- [ ] Exportar formato adequado (`.svg`, `.png`, `.ogg`, etc).
- [ ] Garantir dimensoes e contraste adequados para mobile e desktop.

## 2. Estrutura e nome

- [ ] Salvar em `public/<line>/<slug>/<categoria>/`.
- [ ] Nomear com convencao oficial: `<categoria>-<nome>-v<versao>.<ext>`.
- [ ] Evitar espacos, maiusculas e sufixos ambiguos (`final-final-v3`).

## 3. Manifest

- [ ] Atualizar `public/<line>/<slug>/manifest.json` com chave nova.
- [ ] Se aplicavel, atualizar `fallback.byKey`.
- [ ] Verificar que o path no manifest aponta para arquivo real.

## 4. Auditoria

- [ ] Rodar `npm run assets:audit`.
- [ ] Confirmar status esperado:
  - `ok`: ideal
  - `warning`: permitido, mas revisar
  - `error`: bloqueante, corrigir antes de seguir
- [ ] Se warning for legado intencional, avaliar `tools/assets-audit-allowlist.json`.

## 5. Smoke visual

- [ ] Rodar `npm run test:assets-smoke`.
- [ ] Validar carregamento de assets sem page error.
- [ ] Confirmar fallback funcional quando necessario.

## 6. Validacao manual

- [ ] Verificar desktop (`/arcade/<slug>`).
- [ ] Verificar mobile (viewport pequeno).
- [ ] Validar legibilidade de HUD e estados criticos.

## 7. Integracao

- [ ] Registrar alteracoes no PR com contexto (asset novo, substituicao, legado, fallback).
- [ ] Anexar output relevante do audit (ou JSON de `reports/assets/`).
- [ ] Integrar somente apos audit + smoke + gates globais.

## 8. Gates finais

- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test:unit`
- [ ] `npm run build`
- [ ] `npm run verify`

## Observacoes operacionais

- Nao apagar assets legados cegamente.
- Warnings devem ser visiveis, mas sem virar ruido permanente.
- Erros de manifest/asset faltante bloqueiam merge.
