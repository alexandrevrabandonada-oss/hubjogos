# Tijolos - Protocolo de Execução

## Objetivo

Padronizar entregas incrementais com estabilidade técnica e consequência de produto.

Cada tijolo deve fechar com:

- software executável;
- documentação atualizada;
- validação técnica completa;
- relatório de Estado da Nação.

## Gate obrigatório (sem exceção)

```bash
npm run lint
npm run type-check
npm run build
npm run verify
```

Se qualquer comando falhar, o tijolo permanece aberto.

## Protocolo por fase

1. Diagnóstico de entrada
2. Implementação mínima do objetivo
3. Validação técnica (gate 4/4)
4. Atualização de docs
5. Relatório final em `reports/`

## Convenções de engines (Tijolo 04+)

Cada engine real deve separar:

```text
lib/games/<engine>/
  types.ts
  engine.ts
  data/*.ts
  registry.ts
components/games/<engine>/
  <EngineUI>.tsx
```

Além disso:

- resolução via runtime central (`resolve-engine`), não por condicional espalhada;
- tela final preferencialmente via `GameOutcome`;
- tracking de eventos desacoplado da UI;
- persistência opcional, sem quebrar sem Supabase.

## Eventos mínimos obrigatórios

- game_view
- game_start
- step_advance
- game_complete
- result_copy
- link_copy
- cta_click

## Critério de pronto

Um tijolo está pronto quando:

- [ ] objetivo entregue com impacto real de produto
- [ ] gate técnico 4/4 passou
- [ ] docs atualizadas (`README`, `arquitetura`, `roadmap`, `tijolos`)
- [ ] relatório gerado em `reports/YYYY-MM-DD-HHMM-tijolo-XX-estado-da-nacao.md`
- [ ] não houve regressão nas engines reais já existentes

## Estado atual do protocolo

- Tijolo 03: validou linguagem visual + primeira engine
- Tijolo 04: validou arquitetura operável multi-engine

Próximo alvo: Tijolo 05 (escala de engines + share avançado).

Última atualização: 2026-03-06
